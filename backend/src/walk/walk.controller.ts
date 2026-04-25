import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WalkService } from './walk.service';
import { CreateWalkEventDto } from './dto/create-walk-event.dto';
import { UpdateWalkEventDto } from './dto/update-walk-event.dto';

@ApiTags('Walk Events')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('walk-events')
export class WalkController {
  constructor(private readonly walkService: WalkService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento de caminata' })
  create(@Body() dto: CreateWalkEventDto) {
    return this.walkService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los eventos de caminata' })
  findAll() {
    return this.walkService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un evento de caminata' })
  findOne(@Param('id') id: string) {
    return this.walkService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento de caminata' })
  update(@Param('id') id: string, @Body() dto: UpdateWalkEventDto) {
    return this.walkService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un evento de caminata' })
  remove(@Param('id') id: string) {
    return this.walkService.remove(id);
  }
}
