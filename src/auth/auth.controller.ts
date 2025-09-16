import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, CreateUserResponseDTO, UserResponseDTO } from './dto/create-user.dto';
import { LoginDTO, LoginResponse } from './dto/login.dto';
import { VerifyEmailDTO, VerifyEmailResponseDTO, ResendVerificationDTO, ForgotPasswordDTO, ForgotPasswordResponseDTO, ResetPasswordDTO, ResetPasswordResponseDTO, RefreshTokenDTO, TokenResponseDTO, LogoutDTO } from './dto';
import { createFileInterceptor, resumeUploadOptions } from 'src/utils/upload/multer.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, Public } from './decorators';
import { JwtPayload } from './jwt/jwt.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: CreateUserResponseDTO 
  })
  @UseInterceptors(createFileInterceptor('resume', {
    subDirectory: 'resumes',
    allowedMimeTypes: ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf','.doc','.docx'],
    maxFileSizeBytes: 5 * 1024 * 1024,
    maxFiles: 1,
    useMemoryStorage: true,
  }))
  @ApiConsumes('multipart/form-data')
  async register(
    @UploadedFile() resume: any,
    @Body() data: CreateUserDTO,
  ): Promise<{ error: boolean; msg: string; statusCode: number; data: UserResponseDTO }> {
    return this.authService.registerUser(data, resume);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponse 
  })
  async login(@Body() data: LoginDTO): Promise<{ error: boolean; msg: string; statusCode: number; data: UserResponseDTO }> {
    return this.authService.login(data);
  }

  @Post('verify-email')
  @Public()
  async verifyEmail(@Body() data: VerifyEmailDTO): Promise<VerifyEmailResponseDTO> {
    return this.authService.verifyEmail(data);
  }

  @Post('resend-verification')
  @Public()
  async resendVerificationEmail(@Body() data: ResendVerificationDTO) {
    return this.authService.resendVerificationEmail(data.email);
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists', type: ForgotPasswordResponseDTO })
  async forgotPassword(@Body() data: ForgotPasswordDTO): Promise<ForgotPasswordResponseDTO> {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: ResetPasswordResponseDTO })
  async resetPassword(@Query('token') token: string, @Body() data: ResetPasswordDTO): Promise<ResetPasswordResponseDTO> {
    return this.authService.resetPassword(token, data);
  }

  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens refreshed successfully',
    type: TokenResponseDTO 
  })
  async refreshToken(@Body() data: RefreshTokenDTO): Promise<{ error: boolean; msg: string; statusCode: number; data: TokenResponseDTO }> {
    return this.authService.refreshToken(data);
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout user by revoking refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully' 
  })
  async logout(@Body() data: LogoutDTO): Promise<{ error: boolean; msg: string; statusCode: number }> {
    return this.authService.logout(data);
  }

  @Post('logout-all-devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user from all devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out from all devices successfully' 
  })
  async logoutAllDevices(@CurrentUser() user: JwtPayload): Promise<{ error: boolean; msg: string; statusCode: number }> {
    return this.authService.logoutAllDevices(user.sub);
  }

  @Get('check-users')
  @Public()
  @ApiOperation({ summary: 'Check all users in database (for debugging)' })
  async checkAllUsers() {
    return this.authService.checkAllUsers();
  }
}
