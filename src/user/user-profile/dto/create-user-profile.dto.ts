import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsUrl, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { GENDER_TYPES } from 'models/user/userProfile.schema';

class EducationDTO {
  @ApiProperty({ description: 'Degree or qualification' })
  @IsString()
  degree: string;

  @ApiProperty({ description: 'Institution name' })
  @IsString()
  institution: string;

  @ApiProperty({ description: 'Field of study', required: false })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ description: 'Currently studying', required: false })
  @IsOptional()
  @IsBoolean()
  currentlyStudying?: boolean;

  @ApiProperty({ description: 'Grade or GPA', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

class ExperienceDTO {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ description: 'Currently working', required: false })
  @IsOptional()
  @IsBoolean()
  currentlyWorking?: boolean;

  @ApiProperty({ description: 'Employment type', required: false })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateUserProfileDTO {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Resume URL', required: false })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @ApiProperty({ description: 'Skills array', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Languages array', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ description: 'Current location', required: false })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiProperty({ description: 'Preferred job location', required: false })
  @IsOptional()
  @IsString()
  preferredJobLocation?: string;

  @ApiProperty({ description: 'Gender', required: false, enum: GENDER_TYPES })
  @IsOptional()
  @IsEnum(GENDER_TYPES)
  gender?: GENDER_TYPES;

  @ApiProperty({ description: 'Age', required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'LinkedIn URL', required: false })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty({ description: 'GitHub URL', required: false })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiProperty({ description: 'Portfolio URL', required: false })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ description: 'Education array', required: false, type: [EducationDTO] })
  @IsOptional()
  @IsArray()
  education?: EducationDTO[];

  @ApiProperty({ description: 'Experience array', required: false, type: [ExperienceDTO] })
  @IsOptional()
  @IsArray()
  experience?: ExperienceDTO[];
} 