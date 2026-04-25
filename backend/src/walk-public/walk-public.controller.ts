import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalkDashboardService } from '../walk-dashboard/walk-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Walk Public Preview')
@Controller('walk-public')
export class WalkPublicController {
  constructor(
    private readonly dashboardService: WalkDashboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('active-event')
  @ApiOperation({ summary: 'Obtener el evento activo (público, sin auth)' })
  async getActiveEvent() {
    const event = await this.prisma.walkEvent.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { year: 'desc' },
    });
    return event;
  }

  @Get('events')
  @ApiOperation({ summary: 'Listar eventos (público, sin auth)' })
  async getEvents() {
    return this.prisma.walkEvent.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: { select: { sales: true, sponsors: true, items: true } },
      },
    });
  }

  @Get(':eventId/stats')
  @ApiOperation({ summary: 'Estadísticas completas (público, sin auth)' })
  getStats(@Param('eventId') eventId: string) {
    return this.dashboardService.getStats(eventId);
  }

  @Get(':eventId/heatmap')
  @ApiOperation({ summary: 'Heatmap de ventas (público, sin auth)' })
  getHeatmap(@Param('eventId') eventId: string) {
    return this.dashboardService.getHeatmap(eventId);
  }

  @Get(':eventId/expenses')
  @ApiOperation({ summary: 'Gastos operativos (público, sin auth)' })
  getExpenses(@Param('eventId') eventId: string) {
    return this.dashboardService.getExpenses(eventId);
  }

  @Get(':eventId/allocations')
  @ApiOperation({ summary: 'Destino de fondos (público, sin auth)' })
  getAllocations(@Param('eventId') eventId: string) {
    return this.dashboardService.getAllocations(eventId);
  }

  @Get(':eventId/sales')
  @ApiOperation({ summary: 'Ventas recientes (público, sin auth)' })
  async getSales(@Param('eventId') eventId: string) {
    return this.prisma.sale.findMany({
      where: { walkEventId: eventId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        pointOfSale: { select: { name: true } },
        items: { include: { inventoryItem: { select: { name: true, type: true } } } },
      },
    });
  }

  @Get(':eventId/sponsors')
  @ApiOperation({ summary: 'Patrocinantes (público, sin auth)' })
  async getSponsors(@Param('eventId') eventId: string) {
    return this.prisma.sponsor.findMany({
      where: { walkEventId: eventId },
      orderBy: { tier: 'asc' },
    });
  }

  @Get(':eventId/inventory')
  @ApiOperation({ summary: 'Inventario con stock (público, sin auth)' })
  async getInventory(@Param('eventId') eventId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { walkEventId: eventId },
      include: {
        stock: {
          include: { pointOfSale: { select: { name: true } } },
        },
      },
    });
  }
}
