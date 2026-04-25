import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@ApiTags('Sponsors')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo patrocinante' })
  create(@Body() dto: CreateSponsorDto) {
    return this.sponsorsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar patrocinantes (filtro opcional por evento)' })
  @ApiQuery({ name: 'walkEventId', required: false })
  findAll(@Query('walkEventId') walkEventId?: string) {
    return this.sponsorsService.findAll(walkEventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un patrocinante' })
  findOne(@Param('id') id: string) {
    return this.sponsorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un patrocinante' })
  update(@Param('id') id: string, @Body() dto: UpdateSponsorDto) {
    return this.sponsorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un patrocinante' })
  remove(@Param('id') id: string) {
    return this.sponsorsService.remove(id);
  }
}
