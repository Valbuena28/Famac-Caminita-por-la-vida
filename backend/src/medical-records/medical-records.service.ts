import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MedicalRecord } from '@prisma/client';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MedicalRecordCreateInput): Promise<MedicalRecord> {
    return this.prisma.medicalRecord.create({ data });
  }

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Historial no encontrado');
    return record;
  }

  async update(id: string, data: Prisma.MedicalRecordUpdateInput): Promise<MedicalRecord> {
    return this.prisma.medicalRecord.update({
      where: { id },
      data,
    });
  }
}
