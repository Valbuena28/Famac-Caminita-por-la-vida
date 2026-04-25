import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class ChemotherapyDto {
  @IsNumber()
  quantity: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  suppliedBy?: string;

  @IsString()
  @IsOptional()
  applicationPlace?: string;

  @IsString()
  @IsOptional()
  requestDetails?: string;
}

export class FamilyBackgroundDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  amountBs?: number;
}

export class SocialReportDto {
  @IsString()
  housingType: string;

  @IsString()
  housingCondition: string;

  @IsString()
  @IsOptional()
  socioEconomicAspect?: string;
}

export class FamilyMemberDto {
  @IsString()
  fullName: string;

  @IsString()
  relationship: string;

  @IsNumber()
  age: number;

  @IsString()
  @IsOptional()
  ci?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsBoolean()
  @IsOptional()
  works?: boolean;
}

export class MedicalRecordDto {
  @IsString()
  diagnosis: string;

  @IsString()
  @IsOptional()
  treatingDoctor?: string;

  @IsDateString()
  @IsOptional()
  surgeryDate?: string;

  @IsString()
  @IsOptional()
  surgeryType?: string;

  @IsString()
  @IsOptional()
  indicatedTreatment?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChemotherapyDto)
  @IsOptional()
  chemotherapies?: ChemotherapyDto[];
}

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  fileNumber?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  ci: string;

  @IsDateString()
  dateOfBirth: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsOptional()
  civilStatus?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  municipality?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  familyHistory?: string;

  @IsBoolean()
  @IsOptional()
  isDeceased?: boolean;

  @ValidateNested()
  @Type(() => MedicalRecordDto)
  @IsOptional()
  medicalRecord?: MedicalRecordDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyBackgroundDto)
  @IsOptional()
  familyBackgrounds?: FamilyBackgroundDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDto)
  @IsOptional()
  familyMembers?: FamilyMemberDto[];

  @ValidateNested()
  @Type(() => SocialReportDto)
  @IsOptional()
  socialReport?: SocialReportDto;
}
