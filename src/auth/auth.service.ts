import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { User } from 'models/user/user.schema';
import { Otp } from 'models/auth/otp/otp.schema';
import { CreateUserDTO, CreateUserResponseDTO, UserResponseDTO, LoginDTO, VerifyEmailDTO, VerifyEmailResponseDTO, ForgotPasswordDTO, ResetPasswordDTO, RefreshTokenDTO, TokenResponseDTO, LogoutDTO } from './dto';
import { sendVerificaionEmail } from 'src/utils/mailtrap/mail.service';
import { sendPasswordResetEmail, sendResetSuccessEmail } from 'src/utils/mailtrap/mail.service';
import { PasswordReset } from 'models/auth/password-reset/passwordReset.schema';
import { uploadBufferToCloudinary } from 'src/utils/upload/cloudinary';
import { JwtTokenService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectModel(PasswordReset.name) private readonly passwordResetModel: Model<PasswordReset>,
    private readonly jwtTokenService: JwtTokenService,
    // private readonly mailtrapService: MailtrapService,
  ) {}

  // Custom function to generate numeric OTP
  private generateNumericOTP(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  async registerUser(
    data: CreateUserDTO,
    resume?: any,
  ): Promise<{ error: boolean; msg: string; statusCode: number; data: UserResponseDTO }> {
    
    
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) {
      
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await argon2.hash(data.password);

    let resumeUrl: string | undefined;
    if (resume?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(resume.buffer, {
        folder: 'resumes',
        resourceType: 'raw',
      });
      resumeUrl = uploadResult.secure_url;
    }

    const newUser = await this.userModel.create({
      ...data,
      password: hashedPassword,
      isEmailVerified: false,
      resumeUrl,
    });
    
    

    // Generate OTP
    const otpCode = this.generateNumericOTP();

    // Save OTP to database
    const otp = await this.otpModel.create({
      userId: newUser._id,
      otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send verification email
    try {
      await sendVerificaionEmail(data.email, otpCode);
    } catch (error) {
      // Delete the user and OTP if email sending fails
      await this.userModel.findByIdAndDelete(newUser._id);
      await this.otpModel.findByIdAndDelete(otp._id);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    // Convert ObjectId to string to ensure consistent ID format
    const userData = {
      ...newUser.toObject(),
      _id: (newUser._id as any).toString()
    };
   
    const response = UserResponseDTO.transform(userData);
    return {
      error: false,
      msg: 'User created successfully. Please check your email for verification code.',
      statusCode: HttpStatus.CREATED,
      data: response,
    };
  }

  async verifyEmail(data: VerifyEmailDTO): Promise<VerifyEmailResponseDTO> {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = await this.otpModel.findOne({
      userId: user._id,
      otpCode: data.otpCode,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { isUsed: true });

    // Mark user email as verified
    await this.userModel.findByIdAndUpdate(user._id, { isEmailVerified: true });

    return {
      error: false,
      msg: 'Email verified successfully',
      statusCode: HttpStatus.OK,
      data: {
        email: user.email,
        isEmailVerified: true,
      },
    };
  }

  async login(credentials: LoginDTO): Promise<{ error: boolean; msg: string; statusCode: number; data: UserResponseDTO & { tokens: TokenResponseDTO } }> {
    
    
    const user = await this.userModel
      .findOne({ email: credentials.email })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    

    const passwordMatch = await argon2.verify(user.password, credentials.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate JWT tokens
    const tokenPair = await this.jwtTokenService.generateTokenPair(user);

    // Log tokens for testing (remove in production)
    console.log('JWT Tokens for Testing:');
    console.log('Access Token:', tokenPair.accessToken);
    console.log('=====================================');

    // Convert ObjectId to string to ensure consistent ID format
    const userData = {
      ...user.toObject(),
      _id: (user._id as any).toString()
    };
  
    const response = UserResponseDTO.transform(userData);
    
    const tokens: TokenResponseDTO = {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };

    return {
      error: false,
      msg: 'Login successful',
      statusCode: HttpStatus.OK,
      data: {
        ...response,
        tokens,
      },
    };
  }

  async checkAllUsers(): Promise<any> {
    const allUsers = await this.userModel.find({}).select('email _id isEmailVerified');
  
    return allUsers;
  }

  async resendVerificationEmail(email: string): Promise<{ error: boolean; msg: string; statusCode: number }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing unused OTPs for this user
    await this.otpModel.deleteMany({
      userId: user._id,
      isUsed: false,
    });

    // Generate new OTP
    const otpCode = this.generateNumericOTP();

    // Save new OTP
    await this.otpModel.create({
      userId: user._id,
      otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send verification email
    try {
      await sendVerificaionEmail(email, otpCode);
    } catch (error) {
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return {
      error: false,
      msg: 'Verification email sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<{ error: boolean; msg: string; statusCode: number }> {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      // Do not reveal whether the email exists
      return { error: false, msg: 'If that email exists, a reset link has been sent', statusCode: HttpStatus.OK };
    }

    const token = (await argon2.hash(user.email + Date.now().toString())).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate previous unused tokens for this user
    await this.passwordResetModel.updateMany({ userId: user._id, isUsed: false }, { isUsed: true });

    await this.passwordResetModel.create({
      userId: user._id as unknown as Types.ObjectId,
      token,
      expiresAt: expires,
    });

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetURL);
    } catch (e) {
      // still respond with OK to avoid enumeration
    }

    return { error: false, msg: 'If that email exists, a reset link has been sent', statusCode: HttpStatus.OK };
  }

  async resetPassword(token: string, data: ResetPasswordDTO): Promise<{ error: boolean; msg: string; statusCode: number }> {
    const pr = await this.passwordResetModel.findOne({ token, isUsed: false, expiresAt: { $gt: new Date() } });
    if (!pr) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findById(pr.userId).select('+password');
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(data.password);

    await this.userModel.updateOne({ _id: user._id }, { password: hashedPassword });
    await this.passwordResetModel.updateOne({ _id: pr._id }, { isUsed: true });

    try { await sendResetSuccessEmail(user.email); } catch {}

    return { error: false, msg: 'Password reset successful', statusCode: HttpStatus.OK };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenDTO): Promise<{ error: boolean; msg: string; statusCode: number; data: TokenResponseDTO }> {
    try {
      const tokenPair = await this.jwtTokenService.refreshAccessToken(data.refreshToken);
      
      const tokens: TokenResponseDTO = {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 900, // 15 minutes in seconds
      };

      return {
        error: false,
        msg: 'Tokens refreshed successfully',
        statusCode: HttpStatus.OK,
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(data: LogoutDTO): Promise<{ error: boolean; msg: string; statusCode: number }> {
    try {
      await this.jwtTokenService.revokeRefreshToken(data.refreshToken);
      
      return {
        error: false,
        msg: 'Logged out successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      // Even if token is invalid, we should return success for security
      return {
        error: false,
        msg: 'Logged out successfully',
        statusCode: HttpStatus.OK,
      };
    }
  }

  /**
   * Logout user from all devices
   */
  async logoutAllDevices(userId: string): Promise<{ error: boolean; msg: string; statusCode: number }> {
    try {
      await this.jwtTokenService.revokeAllUserTokens(userId);
      
      return {
        error: false,
        msg: 'Logged out from all devices successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new BadRequestException('Failed to logout from all devices');
    }
  }

  /**
   * Get user by ID for JWT service
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId);
  }
}
