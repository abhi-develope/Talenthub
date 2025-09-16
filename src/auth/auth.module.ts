import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'models/user/user.schema';
import { Otp, OtpSchema } from 'models/auth/otp/otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordReset, PasswordResetSchema } from 'models/auth/password-reset/passwordReset.schema';
import { AccessToken, AccessTokenSchema } from 'models/auth/access-token/accessToken.schema';
import { RefreshToken, RefreshTokenSchema } from 'models/auth/refresh-token/refreshToken.schema';
import { JwtTokenService } from './jwt/jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
// import { MailtrapService } from 'src/utils/mailtrap/mailtrap.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
      { name: AccessToken.name, schema: AccessTokenSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    JwtAuthGuard,
    RolesGuard,
    // MailtrapService
  ],
  exports: [
    AuthService,
    JwtTokenService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
