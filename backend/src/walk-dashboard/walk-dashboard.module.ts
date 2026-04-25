import { Module } from '@nestjs/common';
import { WalkDashboardController } from './walk-dashboard.controller';
import { WalkDashboardService } from './walk-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WalkDashboardController],
  providers: [WalkDashboardService],
  exports: [WalkDashboardService],
})
export class WalkDashboardModule {}
