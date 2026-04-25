import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getProfile() {
    let config = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          id: 1,
          foundationName: 'Fundación Amigos de la Mujer con Cáncer de Mama (FAMAC)',
          director: 'Presidenta: Sra. María Antonieta',
          address: 'Centro Comercial Costa Verde, Planta Alta, Local 85',
          phone: '+58 0414-XXXXXXX',
          email: 'contacto@famac.org'
        }
      });
    }
    return config;
  }

  async updateProfile(data: any) {
    return this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        foundationName: data.foundationName,
        director: data.director,
        address: data.address,
        phone: data.phone,
        email: data.email
      },
      create: {
        id: 1,
        foundationName: data.foundationName ?? '',
        director: data.director ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? ''
      }
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async createAuditLog(action: string, user: string, target: string, severity: string) {
    return this.prisma.auditLog.create({
      data: { action, user, target, severity }
    });
  }
}
