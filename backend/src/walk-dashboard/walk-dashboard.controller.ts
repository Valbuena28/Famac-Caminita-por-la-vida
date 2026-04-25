import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WalkDashboardService } from './walk-dashboard.service';
import { CreateExpenseDto, CreateAllocationDto } from './dto/walk-dashboard.dto';

@ApiTags('Walk Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('walk-dashboard')
export class WalkDashboardController {
  constructor(private readonly dashboardService: WalkDashboardService) {}

  @Get('historical')
  @ApiOperation({ summary: 'Comparativo histórico: recaudación año vs año' })
  getHistorical() {
    return this.dashboardService.getHistorical();
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Estadísticas completas del evento de caminata' })
  getStats(@Param('eventId') eventId: string) {
    return this.dashboardService.getStats(eventId);
  }

  @Get(':eventId/heatmap')
  @ApiOperation({ summary: 'Mapa de calor: ventas por punto de venta' })
  getHeatmap(@Param('eventId') eventId: string) {
    return this.dashboardService.getHeatmap(eventId);
  }

  @Get(':eventId/expenses')
  @ApiOperation({ summary: 'Listar gastos operativos del evento' })
  getExpenses(@Param('eventId') eventId: string) {
    return this.dashboardService.getExpenses(eventId);
  }

  @Post(':eventId/expenses')
  @ApiOperation({ summary: 'Registrar un gasto operativo' })
  createExpense(@Param('eventId') eventId: string, @Body() dto: CreateExpenseDto) {
    return this.dashboardService.createExpense(eventId, dto);
  }

  @Get(':eventId/allocations')
  @ApiOperation({ summary: 'Listar destino de fondos (trazabilidad)' })
  getAllocations(@Param('eventId') eventId: string) {
    return this.dashboardService.getAllocations(eventId);
  }

  @Post(':eventId/allocations')
  @ApiOperation({ summary: 'Registrar destino de fondos: dinero → tratamientos' })
  createAllocation(@Param('eventId') eventId: string, @Body() dto: CreateAllocationDto) {
    return this.dashboardService.createAllocation(eventId, dto);
  }
}
