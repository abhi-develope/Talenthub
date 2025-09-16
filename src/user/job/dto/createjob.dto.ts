import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import {
  JOB_TYPE_VALUES,
  WORK_MODE_VALUES,
  DEPARTMENT_VALUES,
  VISIBILITY_VALUES,
  EXPERIENCE_VALUES,
  NOTICE_PERIOD_VALUES,
  COUNTRY_VALUES,
  STATE_VALUES,
  CITY_VALUES,
} from 'models/job/job.schema';
import { BaseDTO, BaseResponse } from 'src/utils/responses';

// ---------- Nested DTOs ----------
class SalaryRangeDTO {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  max: number;

  @ApiProperty({ default: 'INR' })
  @IsString()
  currency: string;
}

class JobLocationDTO {
  @ApiProperty({ enum: COUNTRY_VALUES })
  @IsEnum(COUNTRY_VALUES)
  country: COUNTRY_VALUES;

  @ApiProperty({ enum: STATE_VALUES })
  @IsEnum(STATE_VALUES)
  state: STATE_VALUES;

  @ApiProperty({ enum: CITY_VALUES })
  @IsEnum(CITY_VALUES)
  city: CITY_VALUES;
}

// ---------- Base DTO ----------
export class JobBaseDTO extends BaseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  jobTitle: string;

  @ApiProperty({ enum: JOB_TYPE_VALUES })
  @IsEnum(JOB_TYPE_VALUES)
  @Expose()
  jobType: JOB_TYPE_VALUES;

  @ApiProperty({ enum: WORK_MODE_VALUES })
  @IsEnum(WORK_MODE_VALUES)
  @Expose()
  workMode: WORK_MODE_VALUES;

  @ApiProperty({ enum: DEPARTMENT_VALUES })
  @IsEnum(DEPARTMENT_VALUES)
  @Expose()
  department: DEPARTMENT_VALUES;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @Expose()
  jobExpiry: Date;

  @ApiProperty({ enum: VISIBILITY_VALUES })
  @IsEnum(VISIBILITY_VALUES)
  @Expose()
  visibility: VISIBILITY_VALUES;

  @ApiProperty({ enum: EXPERIENCE_VALUES })
  @IsEnum(EXPERIENCE_VALUES)
  @Expose()
  experience: EXPERIENCE_VALUES;

  @ApiProperty({ type: SalaryRangeDTO })
  @ValidateNested()
  @Type(() => SalaryRangeDTO)
  @Expose()
  salaryRange: SalaryRangeDTO;

  @ApiProperty({ type: JobLocationDTO })
  @ValidateNested()
  @Type(() => JobLocationDTO)
  @Expose()
  jobLocation: JobLocationDTO;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Expose()
  numberOfOpenings: number;

  @ApiProperty({ enum: NOTICE_PERIOD_VALUES })
  @IsEnum(NOTICE_PERIOD_VALUES)
  @Expose()
  noticePeriod: NOTICE_PERIOD_VALUES;
}

// ---------- Create DTO ----------
export class CreateJobDTO extends JobBaseDTO {}

// ---------- Response DTO ----------

export class UserJobResponseDTO extends JobBaseDTO {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString()) 
  id: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

// ---------- Wrapper for Create Response ----------
export class CreateJobResponseDTO extends BaseResponse {
  @ApiProperty({ description: 'Details of the newly created job', type: UserJobResponseDTO })
  msg:string;
  data: UserJobResponseDTO;
}
