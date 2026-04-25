import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';
import { AssignStockDto } from './dto/assign-stock.dto';

@Injectable()
export class PointOfSaleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePosDto) {
    return this.prisma.pointOfSale.create({ data: dto });
  }

  async findAll() {
    return this.prisma.pointOfSale.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { sales: true, stock: true } },
      },
    });
  }

  async findOne(id: string) {
    const pos = await this.prisma.pointOfSale.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            inventoryItem: { select: { name: true, type: true, size: true, unitPrice: true } },
          },
        },
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { items: { include: { inventoryItem: { select: { name: true } } } } },
        },
      },
    });
    if (!pos) throw new NotFoundException('Punto de venta no encontrado');
    return pos;
  }

  async update(id: string, dto: UpdatePosDto) {
    await this.findOne(id);
    return this.prisma.pointOfSale.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pointOfSale.delete({ where: { id } });
  }

  async assignStock(posId: string, dto: AssignStockDto) {
    await this.findOne(posId);
    return this.prisma.stock.upsert({
      where: {
        pointOfSaleId_inventoryItemId: {
          pointOfSaleId: posId,
          inventoryItemId: dto.inventoryItemId,
        },
      },
      create: {
        pointOfSaleId: posId,
        inventoryItemId: dto.inventoryItemId,
        assignedQty: dto.assignedQty,
      },
      update: {
        assignedQty: { increment: dto.assignedQty },
      },
    });
  }

  async getStock(posId: string) {
    return this.prisma.stock.findMany({
      where: { pointOfSaleId: posId },
      include: {
        inventoryItem: { select: { name: true, type: true, size: true, unitPrice: true } },
      },
    });
  }
}
