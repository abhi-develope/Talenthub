import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsString()
  @Length(8)
  password: string;
}

export class ResetPasswordResponseDTO extends BaseResponse {
  msg: string;
}


