import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
} 