import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePosDto {
  @ApiProperty({ example: 'C.C. Sambil Maracaibo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Av. La Limpia, Maracaibo' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'María López' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ example: '0414-1234567' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
