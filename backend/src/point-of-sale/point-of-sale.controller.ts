import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PointOfSaleService } from './point-of-sale.service';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';
import { AssignStockDto } from './dto/assign-stock.dto';

@ApiTags('Point of Sale')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('point-of-sale')
export class PointOfSaleController {
  constructor(private readonly posService: PointOfSaleService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo punto de venta (Punto Rosa)' })
  create(@Body() dto: CreatePosDto) {
    return this.posService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puntos de venta' })
  findAll() {
    return this.posService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un punto de venta con stock y ventas recientes' })
  findOne(@Param('id') id: string) {
    return this.posService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un punto de venta' })
  update(@Param('id') id: string, @Body() dto: UpdatePosDto) {
    return this.posService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un punto de venta' })
  remove(@Param('id') id: string) {
    return this.posService.remove(id);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Asignar stock de un producto a este punto de venta' })
  assignStock(@Param('id') id: string, @Body() dto: AssignStockDto) {
    return this.posService.assignStock(id, dto);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Ver stock actual de este punto de venta' })
  getStock(@Param('id') id: string) {
    return this.posService.getStock(id);
  }
}
