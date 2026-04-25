import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true } }) as unknown as User[];
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const salt = await bcrypt.genSalt();
    data.passwordHash = await bcrypt.hash(data.passwordHash, salt);
    return this.prisma.user.create({ data });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'Actualización de Rol Jerárquico',
        user: 'Administrador (Directorio)',
        target: `Usuario afectado: ${updated.email} (${role})`,
        severity: 'warning'
      }
    });

    return updated;
  }

  async remove(id: string): Promise<User> {
    const deleted = await this.prisma.user.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'Eliminación y Revocación de Cuenta',
        user: 'Administrador (Directorio)',
        target: `Personal revocado: ${deleted.email}`,
        severity: 'critical'
      }
    });

    return deleted;
  }
}
