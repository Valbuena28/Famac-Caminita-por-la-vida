import { Module } from '@nestjs/common';
import { WalkPublicController } from './walk-public.controller';
import { WalkDashboardModule } from '../walk-dashboard/walk-dashboard.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [WalkDashboardModule, PrismaModule],
  controllers: [WalkPublicController],
})
export class WalkPublicModule {}
