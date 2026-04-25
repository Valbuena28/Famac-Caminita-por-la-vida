import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo item de inventario (camisa, gorra, número)' })
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar items de inventario' })
  @ApiQuery({ name: 'walkEventId', required: false })
  findAll(@Query('walkEventId') walkEventId?: string) {
    return this.inventoryService.findAll(walkEventId);
  }

  @Get('summary/:walkEventId')
  @ApiOperation({ summary: 'Resumen de stock por evento: asignado, vendido, disponible' })
  getStockSummary(@Param('walkEventId') walkEventId: string) {
    return this.inventoryService.getStockSummary(walkEventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un item con distribución de stock por punto' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un item de inventario' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
