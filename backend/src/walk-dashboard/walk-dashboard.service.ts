import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto, CreateAllocationDto } from './dto/walk-dashboard.dto';

@Injectable()
export class WalkDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Estadísticas completas del evento de caminata.
   * Retorna: recaudación, meta, gastos, margen neto, ventas por punto, patrocinantes, trazabilidad.
   */
  async getStats(eventId: string) {
    const event = await this.prisma.walkEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento no encontrado');

    // Total recaudado
    const salesAgg = await this.prisma.sale.aggregate({
      where: { walkEventId: eventId },
      _sum: { total: true },
      _count: true,
    });

    // Total gastos
    const expensesAgg = await this.prisma.walkExpense.aggregate({
      where: { walkEventId: eventId },
      _sum: { amount: true },
    });

    // Total patrocinios
    const sponsorsAgg = await this.prisma.sponsor.aggregate({
      where: { walkEventId: eventId },
      _sum: { amountBs: true },
      _count: true,
    });

    // Total asignado a tratamientos
    const allocationsAgg = await this.prisma.fundAllocation.aggregate({
      where: { walkEventId: eventId },
      _sum: { amount: true, quantity: true },
    });

    const totalRevenue = salesAgg._sum.total || new Prisma.Decimal(0);
    const totalExpenses = expensesAgg._sum.amount || new Prisma.Decimal(0);
    const totalSponsorships = sponsorsAgg._sum.amountBs || new Prisma.Decimal(0);
    const totalAllocated = allocationsAgg._sum.amount || new Prisma.Decimal(0);
    const netIncome = (totalRevenue as Prisma.Decimal).add(totalSponsorships).sub(totalExpenses);

    // Progreso hacia la meta (porcentaje)
    const progress = (event.goalAmount as Prisma.Decimal).gt(0)
      ? (totalRevenue as Prisma.Decimal).add(totalSponsorships).div(event.goalAmount).mul(100).toNumber()
      : 0;

    return {
      event: {
        id: event.id,
        name: event.name,
        year: event.year,
        status: event.status,
        goalAmount: event.goalAmount,
      },
      revenue: {
        totalSales: salesAgg._count,
        totalRevenue,
        totalSponsorships,
        totalExpenses,
        netIncome,
        progressPercent: Math.min(progress, 100),
      },
      impact: {
        totalAllocated,
        totalTreatments: allocationsAgg._sum.quantity || 0,
        totalSponsors: sponsorsAgg._count,
      },
    };
  }

  /**
   * Mapa de calor: ventas agrupadas por punto de venta
   */
  async getHeatmap(eventId: string) {
    const sales = await this.prisma.sale.groupBy({
      by: ['pointOfSaleId'],
      where: { walkEventId: eventId },
      _sum: { total: true },
      _count: true,
    });

    // Obtener nombres de puntos de venta
    const posIds = sales.map((s) => s.pointOfSaleId);
    const pointsOfSale = await this.prisma.pointOfSale.findMany({
      where: { id: { in: posIds } },
      select: { id: true, name: true, location: true },
    });

    const posMap = new Map(pointsOfSale.map((p) => [p.id, p]));

    return sales
      .map((s) => ({
        pointOfSale: posMap.get(s.pointOfSaleId),
        totalRevenue: s._sum.total || new Prisma.Decimal(0),
        totalSales: s._count,
      }))
      .sort((a, b) => {
        const aVal = Number(a.totalRevenue) || 0;
        const bVal = Number(b.totalRevenue) || 0;
        return bVal - aVal;
      });
  }

  /**
   * Detalle de gastos del evento
   */
  async getExpenses(eventId: string) {
    return this.prisma.walkExpense.findMany({
      where: { walkEventId: eventId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Registrar un gasto operativo
   */
  async createExpense(eventId: string, dto: CreateExpenseDto) {
    return this.prisma.walkExpense.create({
      data: {
        concept: dto.concept,
        amount: dto.amount,
        date: new Date(dto.date),
        notes: dto.notes,
        walkEventId: eventId,
      },
    });
  }

  /**
   * Detalle de asignación de fondos (trazabilidad)
   */
  async getAllocations(eventId: string) {
    return this.prisma.fundAllocation.findMany({
      where: { walkEventId: eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { firstName: true, lastName: true, ci: true } },
      },
    });
  }

  /**
   * Registrar destino de fondos (trazabilidad: dinero → tratamientos)
   */
  async createAllocation(eventId: string, dto: CreateAllocationDto) {
    return this.prisma.fundAllocation.create({
      data: {
        concept: dto.concept,
        amount: dto.amount,
        quantity: dto.quantity,
        notes: dto.notes,
        walkEventId: eventId,
        patientId: dto.patientId,
      },
    });
  }

  /**
   * Comparativo histórico: recaudación año vs año
   */
  async getHistorical() {
    const events = await this.prisma.walkEvent.findMany({
      orderBy: { year: 'asc' },
      select: { id: true, name: true, year: true, goalAmount: true, status: true },
    });

    const historical = [];
    for (const event of events) {
      const salesAgg = await this.prisma.sale.aggregate({
        where: { walkEventId: event.id },
        _sum: { total: true },
        _count: true,
      });
      const expensesAgg = await this.prisma.walkExpense.aggregate({
        where: { walkEventId: event.id },
        _sum: { amount: true },
      });
      historical.push({
        ...event,
        totalRevenue: salesAgg._sum.total || new Prisma.Decimal(0),
        totalSales: salesAgg._count,
        totalExpenses: expensesAgg._sum.amount || new Prisma.Decimal(0),
      });
    }
    return historical;
  }
}
