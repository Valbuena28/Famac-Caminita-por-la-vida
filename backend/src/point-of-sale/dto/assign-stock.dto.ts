import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStockDto {
  @ApiProperty({ description: 'ID del item de inventario' })
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ example: 50, description: 'Cantidad a asignar al punto' })
  @IsInt()
  assignedQty: number;
}
