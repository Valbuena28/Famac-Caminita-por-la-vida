import { IsString, IsInt, IsDecimal, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum WalkEventStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export class CreateWalkEventDto {
  @ApiProperty({ example: 'Caminata Rosa 2026' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year: number;

  @ApiProperty({ example: '50000.00', description: 'Meta de recaudación en Bs' })
  @IsDecimal()
  goalAmount: string;

  @ApiPropertyOptional({ enum: WalkEventStatus, default: 'PLANNING' })
  @IsOptional()
  @IsEnum(WalkEventStatus)
  status?: WalkEventStatus;

  @ApiPropertyOptional({ example: '2026-10-01T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-01T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
