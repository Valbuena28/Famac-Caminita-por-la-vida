import { IsString, IsInt, IsDecimal, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum ProductType {
  SHIRT = 'SHIRT',
  CAP = 'CAP',
  NUMBER = 'NUMBER',
  OTHER = 'OTHER',
}

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Camisa Rosa Talla M' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProductType, example: 'SHIRT' })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({ example: 'M' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: '15.00', description: 'Precio unitario en Bs' })
  @IsDecimal()
  unitPrice: string;

  @ApiProperty({ example: 500, description: 'Cantidad total producida/comprada' })
  @IsInt()
  totalQty: number;

  @ApiProperty({ description: 'ID del evento de caminata' })
  @IsString()
  walkEventId: string;
}
