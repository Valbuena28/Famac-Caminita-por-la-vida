import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalkEventDto } from './dto/create-walk-event.dto';
import { UpdateWalkEventDto } from './dto/update-walk-event.dto';

@Injectable()
export class WalkService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWalkEventDto) {
    return this.prisma.walkEvent.create({
      data: {
        name: dto.name,
        year: dto.year,
        goalAmount: dto.goalAmount,
        status: dto.status as any,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.walkEvent.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: { sales: true, sponsors: true, items: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.walkEvent.findUnique({
      where: { id },
      include: {
        items: true,
        sponsors: true,
        expenses: true,
        allocations: { include: { patient: { select: { firstName: true, lastName: true } } } },
        _count: { select: { sales: true } },
      },
    });
    if (!event) throw new NotFoundException('Evento de caminata no encontrado');
    return event;
  }

  async update(id: string, dto: UpdateWalkEventDto) {
    await this.findOne(id);
    return this.prisma.walkEvent.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      } as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.walkEvent.delete({ where: { id } });
  }
}
