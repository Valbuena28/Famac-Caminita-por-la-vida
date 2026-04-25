import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Post()
  create(@Body() createRecordDto: Prisma.MedicalRecordCreateInput) {
    return this.medicalRecordsService.create(createRecordDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findByPatientId(patientId);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecordDto: Prisma.MedicalRecordUpdateInput) {
    return this.medicalRecordsService.update(id, updateRecordDto);
  }
}
