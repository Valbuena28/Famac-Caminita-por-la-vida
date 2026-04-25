import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrismaModule } from './prisma/prisma.module';
import { DeceasedRecordsModule } from './deceased-records/deceased-records.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
// 🚶 Módulo Caminata FAMAC
import { WalkModule } from './walk/walk.module';
import { PointOfSaleModule } from './point-of-sale/point-of-sale.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { WalkDashboardModule } from './walk-dashboard/walk-dashboard.module';
import { WalkPublicModule } from './walk-public/walk-public.module';

// Forzando un hot-reload para recargar la memoria del Prisma Client generado
@Module({
  imports: [
    UsersModule, 
    PatientsModule, 
    AppointmentsModule, 
    MedicalRecordsModule, 
    PrismaModule, 
    DeceasedRecordsModule, 
    AuthModule, 
    DashboardModule,
    SettingsModule,
    // 🚶 Módulo Caminata
    WalkModule,
    PointOfSaleModule,
    InventoryModule,
    SalesModule,
    SponsorsModule,
    WalkDashboardModule,
    WalkPublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

