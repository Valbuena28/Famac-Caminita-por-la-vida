import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles(Role.ADMIN)
  @Get('profile')
  getProfile() {
    return this.settingsService.getProfile();
  }

  @Roles(Role.ADMIN)
  @Patch('profile')
  updateProfile(@Body() body: any) {
    return this.settingsService.updateProfile(body);
  }

  @Roles(Role.ADMIN)
  @Get('audit-logs')
  getAuditLogs() {
    return this.settingsService.getAuditLogs();
  }
}
