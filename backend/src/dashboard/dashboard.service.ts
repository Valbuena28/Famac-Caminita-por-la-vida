import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalPatients = await this.prisma.patient.count();
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointmentsToday = await this.prisma.appointment.count({
      where: { date: { gte: start, lte: end } }
    });

    const activeTreatments = await this.prisma.chemotherapy.count({
      where: { status: 'En Proceso' }
    });

    // Simulating +/- percentage change based on some mock threshold or purely static for UI demo purposes for now
    const nextAppointments = await this.prisma.appointment.findMany({
      take: 5,
      where: { date: { gte: start } },
      orderBy: { date: 'asc' },
      include: {
        patient: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    const dailyLogs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      totalPatients: {
        value: totalPatients,
        change: '+12%',
      },
      appointmentsToday: {
        value: appointmentsToday,
        change: '+5%',
      },
      activeTreatments: {
        value: activeTreatments,
        change: '-2%',
      },
      nextAppointments,
      dailyLogs
    };
  }

  async addManualLog(user: any, payload: { action: string, target: string, severity: string }) {
    return this.prisma.auditLog.create({
      data: {
        action: payload.action,
        user: `${user.firstName || 'Usuario'} ${user.lastName || 'Manual'}`,
        target: payload.target || 'Novedad de Operaciones',
        severity: payload.severity || 'info'
      }
    });
  }
}
