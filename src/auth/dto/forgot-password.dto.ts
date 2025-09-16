import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class ForgotPasswordDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ForgotPasswordResponseDTO extends BaseResponse {
  msg: string;
}


