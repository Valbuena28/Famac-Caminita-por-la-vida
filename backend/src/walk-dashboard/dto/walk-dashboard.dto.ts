import { IsString, IsDecimal, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Logística' })
  @IsString()
  concept: string;

  @ApiProperty({ example: '2500.00' })
  @IsDecimal()
  amount: string;

  @ApiProperty({ example: '2026-10-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Transporte de mercancía' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateAllocationDto {
  @ApiProperty({ example: 'Mamografías' })
  @IsString()
  concept: string;

  @ApiProperty({ example: '10000.00' })
  @IsDecimal()
  amount: string;

  @ApiPropertyOptional({ example: 500, description: 'Cantidad de tratamientos costeados' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID de paciente específico (opcional)' })
  @IsOptional()
  @IsString()
  patientId?: string;
}
