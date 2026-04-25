import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    try {
      return await this.patientsService.create(createPatientDto);
    } catch (err: any) {
      console.error("PRISMA ERROR CATCHED:", err);
      if (err.code === 'P2002') {
        throw new BadRequestException('El número de expediente o la cédula ingresada ya existe. Escoja otro.');
      }
      throw new BadRequestException(`Fallo en la BD: ${err.message || err}`);
    }
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @Get()
  findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: CreatePatientDto) {
    try {
      return await this.patientsService.update(id, updatePatientDto);
    } catch(err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('El número de expediente o la cédula ingresada ya existe. Escoja otro.');
      }
      throw new BadRequestException(`Fallo en la BD: ${err.message || err}`);
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Post(':id/deceased')
  markDeceased(
    @Param('id') id: string,
    @Body() deceasedData: Prisma.DeceasedRecordCreateWithoutPatientInput
  ) {
    return this.patientsService.markAsDeceased(id, deceasedData);
  }
}
