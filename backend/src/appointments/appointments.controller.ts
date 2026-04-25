import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Prisma, AppointmentStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post()
  create(@Body() createAppointmentDto: Prisma.AppointmentCreateInput) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findByDoctorId(doctorId);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: Prisma.AppointmentUpdateInput) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.delete(id);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: AppointmentStatus) {
    return this.appointmentsService.updateStatus(id, status);
  }
}
