import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSponsorDto) {
    return this.prisma.sponsor.create({
      data: {
        companyName: dto.companyName,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        tier: dto.tier as any,
        amountBs: dto.amountBs,
        logoUrl: dto.logoUrl,
        benefits: dto.benefits,
        walkEventId: dto.walkEventId,
      },
    });
  }

  async findAll(walkEventId?: string) {
    return this.prisma.sponsor.findMany({
      where: walkEventId ? { walkEventId } : undefined,
      orderBy: [{ tier: 'asc' }, { companyName: 'asc' }],
      include: {
        walkEvent: { select: { name: true, year: true } },
      },
    });
  }

  async findOne(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
      include: { walkEvent: { select: { name: true, year: true } } },
    });
    if (!sponsor) throw new NotFoundException('Patrocinante no encontrado');
    return sponsor;
  }

  async update(id: string, dto: UpdateSponsorDto) {
    await this.findOne(id);
    return this.prisma.sponsor.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sponsor.delete({ where: { id } });
  }
}
