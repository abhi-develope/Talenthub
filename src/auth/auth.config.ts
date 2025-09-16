import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const JwtConfig = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    },
  }),
  inject: [ConfigService],
});

export const JwtRefreshConfig = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_REFRESH_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
  }),
  inject: [ConfigService],
});
