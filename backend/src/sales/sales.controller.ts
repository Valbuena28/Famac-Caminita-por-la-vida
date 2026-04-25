import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una venta (actualiza stock automáticamente)' })
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con filtros opcionales' })
  @ApiQuery({ name: 'walkEventId', required: false })
  @ApiQuery({ name: 'pointOfSaleId', required: false })
  findAll(
    @Query('walkEventId') walkEventId?: string,
    @Query('pointOfSaleId') pointOfSaleId?: string,
  ) {
    return this.salesService.findAll(walkEventId, pointOfSaleId);
  }

  @Get('total/:walkEventId')
  @ApiOperation({ summary: 'Total recaudado por evento de caminata' })
  getTotalByEvent(@Param('walkEventId') walkEventId: string) {
    return this.salesService.getTotalByEvent(walkEventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una venta' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
