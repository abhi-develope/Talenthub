import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from 'models/job/job.schema';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JwtTokenService } from 'src/auth/jwt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema },
    
  ]),
  AuthModule,
],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
