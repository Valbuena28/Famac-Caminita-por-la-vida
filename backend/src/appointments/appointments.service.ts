import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Appointment, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return this.prisma.appointment.create({ data });
  }

  async findAll(): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      include: { patient: true, doctor: true },
      orderBy: { date: 'asc' }
    });
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: true },
      orderBy: { date: 'asc' }
    });
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { patient: true, doctor: true }
    });
  }

  async delete(id: string): Promise<Appointment> {
    return this.prisma.appointment.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: { status }
    });
  }
}
