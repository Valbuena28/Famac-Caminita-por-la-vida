import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        size: dto.size,
        unitPrice: dto.unitPrice,
        totalQty: dto.totalQty,
        walkEventId: dto.walkEventId,
      },
    });
  }

  async findAll(walkEventId?: string) {
    return this.prisma.inventoryItem.findMany({
      where: walkEventId ? { walkEventId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        walkEvent: { select: { name: true, year: true } },
        _count: { select: { stock: true, saleItems: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        stock: {
          include: { pointOfSale: { select: { name: true, location: true } } },
        },
        walkEvent: { select: { name: true, year: true } },
      },
    });
    if (!item) throw new NotFoundException('Item de inventario no encontrado');
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  /** Resumen de stock: total asignado, total vendido, disponible */
  async getStockSummary(walkEventId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { walkEventId },
      include: {
        stock: true,
      },
    });

    return items.map((item) => {
      const totalAssigned = item.stock.reduce((sum, s) => sum + s.assignedQty, 0);
      const totalSold = item.stock.reduce((sum, s) => sum + s.soldQty, 0);
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        totalQty: item.totalQty,
        totalAssigned,
        totalSold,
        availableToAssign: item.totalQty - totalAssigned,
        availableToSell: totalAssigned - totalSold,
      };
    });
  }
}
