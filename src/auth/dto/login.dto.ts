import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { BaseDTO, BaseResponse } from 'src/utils/responses';
import { UserResponseDTO } from './create-user.dto';

export class LoginDTO extends BaseDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class LoginResponse extends BaseResponse {
  @ApiProperty({
    description: 'Details of the logged in user',
    type: UserResponseDTO,
  })
  data: UserResponseDTO;
}
