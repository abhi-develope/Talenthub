import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from 'config/db.config';
import { AuthModule } from './auth/auth.module';
import { HrModule } from './hr/hr.module';
import { MainUserModule } from './user/MainUser.module';
import { UserModule } from './user/user-profile/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
      inject: [ConfigService],
    }),
    AuthModule,
    MainUserModule,
    HrModule,
    
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
