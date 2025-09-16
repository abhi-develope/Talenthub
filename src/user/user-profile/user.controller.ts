import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserProfileDTO } from './dto/create-user-profile.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { GetUserProfileResponseDTO } from './dto/get-user-profile.dto';
import { createFileInterceptor } from 'src/utils/upload/multer.config';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { Roles, CurrentUser, Public } from '../../auth/decorators';
import { ROLE_VALUES } from 'models/user/user.schema';
import { JwtPayload } from '../../auth/jwt/jwt.service';

@ApiTags('User Profile')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_VALUES.HR,ROLE_VALUES.USER)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

 
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User profile created successfully',
    type: GetUserProfileResponseDTO,
  })
 
  @Post('profile/:userId')
  @UseInterceptors(
    createFileInterceptor('resume', {
      subDirectory: 'resumes',
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      allowedExtensions: ['.pdf', '.doc', '.docx'],
      maxFileSizeBytes: 5 * 1024 * 1024,
      maxFiles: 1,
      useMemoryStorage: true,
    }),
  )
  @ApiConsumes('multipart/form-data')
  async createUserProfile(
    @Param('userId') userId: string,
    @Body() createUserProfileDto: CreateUserProfileDTO,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() resume?: any,
  ): Promise<GetUserProfileResponseDTO> {
    // Users can only create their own profile
    if (user.sub !== userId) {
      throw new Error('You can only create your own profile');
    }
    
    const userProfile = await this.userService.createUserProfile(userId, createUserProfileDto, resume);
    
    return {
      error: false,
      statusCode: HttpStatus.CREATED,
      data: userProfile,
    };
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: GetUserProfileResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User profile not found',
  })
  async getUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<GetUserProfileResponseDTO> {
    // Users can only view their own profile, HR can view any profile
    if (user.role === ROLE_VALUES.USER && user.sub !== userId) {
      throw new Error('You can only view your own profile');
    }
    
    const userProfile = await this.userService.getUserProfile(userId);
    
    return {
      error: false,
      statusCode: HttpStatus.OK,
      data: userProfile,
    };
  }

  @Put('profile/:userId')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: GetUserProfileResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User profile not found',
  })
  @UseInterceptors(
    createFileInterceptor('resume', {
      subDirectory: 'resumes',
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      allowedExtensions: ['.pdf', '.doc', '.docx'],
      maxFileSizeBytes: 5 * 1024 * 1024,
      maxFiles: 1,
      useMemoryStorage: true,
    }),
  )
  @ApiConsumes('multipart/form-data')
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDTO,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() resume?: any,
  ): Promise<GetUserProfileResponseDTO> {
    // Users can only update their own profile
    if (user.sub !== userId) {
      throw new Error('You can only update your own profile');
    }
    
    const userProfile = await this.userService.updateUserProfile(userId, updateUserProfileDto, resume);
    
    return {
      error: false,
      statusCode: HttpStatus.OK,
      data: userProfile,
    };
  }

  @Delete('profile/:userId')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User profile not found',
  })
  async deleteUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ error: boolean; statusCode: number; message: string }> {
    // Users can only delete their own profile, HR can delete any profile
    if (user.role === ROLE_VALUES.USER && user.sub !== userId) {
      throw new Error('You can only delete your own profile');
    }
    
    await this.userService.deleteUserProfile(userId);
    
    return {
      error: false,
      statusCode: HttpStatus.OK,
      message: 'User profile deleted successfully',
    };
  }
} 