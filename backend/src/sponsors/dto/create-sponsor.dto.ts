import { IsString, IsOptional, IsDecimal, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum SponsorTier {
  DIAMOND = 'DIAMOND',
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
}

export class CreateSponsorDto {
  @ApiProperty({ example: 'Empresas Polar' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ example: 'Carlos Rodríguez' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ example: 'carlos@polar.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '0414-9876543' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: SponsorTier, example: 'GOLD' })
  @IsEnum(SponsorTier)
  tier: SponsorTier;

  @ApiPropertyOptional({ example: '5000.00', description: 'Monto del patrocinio en Bs' })
  @IsOptional()
  @IsDecimal()
  amountBs?: string;

  @ApiPropertyOptional({ description: 'URL del logo de la empresa' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Beneficios acordados para este patrocinante' })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ description: 'ID del evento de caminata' })
  @IsString()
  walkEventId: string;
}
