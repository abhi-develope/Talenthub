import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';
import { Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, ValidateIf } from 'class-validator';
import { COMPANY_SIZE_VALUES, INDUSTRY_VALUES, ROLE_VALUES, SUB_ROLE_VALUES } from 'models/user/user.schema';
import { BaseDTO } from 'src/utils/responses';

export class CreateUserDTO extends BaseDTO {
  @ApiProperty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: ROLE_VALUES, required: false })
  @IsOptional()
  @IsEnum(ROLE_VALUES)
  @Expose()
  role?: ROLE_VALUES;

  @ApiProperty({ enum: SUB_ROLE_VALUES, required: false, description: 'Required when role is user' })
  @ValidateIf((o) => !o.role || o.role === ROLE_VALUES.USER)
  @IsEnum(SUB_ROLE_VALUES)
  @IsNotEmpty()
  @Expose()
  subRole?: SUB_ROLE_VALUES;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsNotEmpty()
  @Expose()
  companyName?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsNotEmpty()
  @Expose()
  cin?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsEmail()
  @Expose()
  companyMail?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsNotEmpty()
  @Expose()
  companyContact?: string;

  @ApiProperty({ enum:INDUSTRY_VALUES , required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsEnum(INDUSTRY_VALUES)
  @Expose()
  industry?: string;

  @ApiProperty({ enum: COMPANY_SIZE_VALUES, required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsEnum(COMPANY_SIZE_VALUES)
  @Expose()
  companySize?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === ROLE_VALUES.HR)
  @IsNotEmpty()
  @Expose()
  companyAddress?: string;
}

export class UserResponseDTO extends BaseDTO {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty({ required: false })
  @Expose()
  subRole?: string;

  @ApiProperty({ required: false })
  @Expose()
  resumeUrl?: string;

  @ApiProperty()
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty()
  @Expose()
  isProfileCompleted: boolean;

  @ApiProperty({ required: false })
@Expose()
companyName?: string;

@ApiProperty({ required: false })
@Expose()
cin?: string;

@ApiProperty({ required: false })
@Expose()
companyMail?: string;

@ApiProperty({ required: false })
@Expose()
companyContact?: string;

@ApiProperty({ required: false })
@Expose()
industry?: string;

@ApiProperty({ required: false })
@Expose()
companySize?: string;

@ApiProperty({ required: false })
@Expose()
companyAddress?: string;


}

export class CreateUserResponseDTO extends BaseResponse {
  @ApiProperty({
    description: 'Details of the newly created user',
    type: UserResponseDTO,
  })
  data: UserResponseDTO;
}
