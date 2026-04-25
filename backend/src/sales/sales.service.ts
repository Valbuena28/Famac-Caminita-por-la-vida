import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra una venta y actualiza automáticamente el stock del punto de venta.
   * Usa una transacción para garantizar consistencia.
   */
  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Calcular totales y validar stock
      let total = new Prisma.Decimal(0);
      const saleItemsData: { inventoryItemId: string; quantity: number; unitPrice: Prisma.Decimal; subtotal: Prisma.Decimal }[] = [];

      for (const item of dto.items) {
        // Obtener precio del item
        const inventoryItem = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (!inventoryItem) throw new BadRequestException(`Item de inventario ${item.inventoryItemId} no encontrado`);

        // Validar stock disponible en el punto de venta
        const stock = await tx.stock.findUnique({
          where: {
            pointOfSaleId_inventoryItemId: {
              pointOfSaleId: dto.pointOfSaleId,
              inventoryItemId: item.inventoryItemId,
            },
          },
        });

        if (!stock) throw new BadRequestException(`No hay stock asignado de "${inventoryItem.name}" en este punto de venta`);
        
        const available = stock.assignedQty - stock.soldQty;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente de "${inventoryItem.name}". Disponible: ${available}, Solicitado: ${item.quantity}`,
          );
        }

        const subtotal = inventoryItem.unitPrice.mul(item.quantity);
        total = total.add(subtotal);

        saleItemsData.push({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitPrice: inventoryItem.unitPrice,
          subtotal,
        });

        // 2. Actualizar stock (incrementar soldQty)
        await tx.stock.update({
          where: {
            pointOfSaleId_inventoryItemId: {
              pointOfSaleId: dto.pointOfSaleId,
              inventoryItemId: item.inventoryItemId,
            },
          },
          data: { soldQty: { increment: item.quantity } },
        });
      }

      // 3. Crear la venta con sus items
      const sale = await tx.sale.create({
        data: {
          customerName: dto.customerName,
          customerCi: dto.customerCi,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          total,
          pointOfSaleId: dto.pointOfSaleId,
          walkEventId: dto.walkEventId,
          items: {
            create: saleItemsData.map((si) => ({
              inventoryItemId: si.inventoryItemId,
              quantity: si.quantity,
              unitPrice: si.unitPrice,
              subtotal: si.subtotal,
            })),
          },
        },
        include: {
          items: { include: { inventoryItem: { select: { name: true } } } },
          pointOfSale: { select: { name: true } },
        },
      });

      return sale;
    });
  }

  async findAll(walkEventId?: string, pointOfSaleId?: string) {
    return this.prisma.sale.findMany({
      where: {
        ...(walkEventId ? { walkEventId } : {}),
        ...(pointOfSaleId ? { pointOfSaleId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { inventoryItem: { select: { name: true, type: true } } } },
        pointOfSale: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { inventoryItem: true } },
        pointOfSale: true,
        walkEvent: { select: { name: true, year: true } },
      },
    });
  }

  /** Total recaudado por evento */
  async getTotalByEvent(walkEventId: string) {
    const result = await this.prisma.sale.aggregate({
      where: { walkEventId },
      _sum: { total: true },
      _count: true,
    });
    return {
      totalSales: result._count,
      totalRevenue: result._sum.total || new Prisma.Decimal(0),
    };
  }
}
