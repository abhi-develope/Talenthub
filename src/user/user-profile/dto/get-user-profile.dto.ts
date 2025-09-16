import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';
import { GENDER_TYPES } from 'models/user/userProfile.schema';

export class UserProfileResponseDTO {

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Resume URL', required: false })
  resumeUrl?: string;

  @ApiProperty({ description: 'Skills array', type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Languages array', type: [String] })
  languages: string[];

  @ApiProperty({ description: 'Current location', required: false })
  currentLocation?: string;

  @ApiProperty({ description: 'Preferred job location', required: false })
  preferredJobLocation?: string;

  @ApiProperty({ description: 'Gender', enum: GENDER_TYPES, required: false })
  gender?: GENDER_TYPES;

  @ApiProperty({ description: 'Age', required: false })
  age?: number;

  @ApiProperty({ description: 'LinkedIn URL', required: false })
  linkedinUrl?: string;

  @ApiProperty({ description: 'GitHub URL', required: false })
  githubUrl?: string;

  @ApiProperty({ description: 'Portfolio URL', required: false })
  portfolioUrl?: string;

  @ApiProperty({ description: 'Education array' })
  education: any[];

  @ApiProperty({ description: 'Experience array' })
  experience: any[];

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class GetUserProfileResponseDTO extends BaseResponse {
  @ApiProperty({
    description: 'User profile data',
    type: UserProfileResponseDTO,
  })
  data: UserProfileResponseDTO;
} 