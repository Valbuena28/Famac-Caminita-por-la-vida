import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({ description: 'ID del item de inventario' })
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ example: 2, description: 'Cantidad vendida' })
  @IsInt()
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ example: 'V-12345678' })
  @IsOptional()
  @IsString()
  customerCi?: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '0414-1234567' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'ID del punto de venta' })
  @IsString()
  pointOfSaleId: string;

  @ApiProperty({ description: 'ID del evento de caminata' })
  @IsString()
  walkEventId: string;

  @ApiProperty({ type: [SaleItemDto], description: 'Lista de productos vendidos' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
