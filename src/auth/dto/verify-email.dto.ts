import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class VerifyEmailDTO {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;
}

export class VerifyEmailResponseDTO extends BaseResponse {
  msg: string;
  data: {
    email: string;
    isEmailVerified: boolean;
  };
} 