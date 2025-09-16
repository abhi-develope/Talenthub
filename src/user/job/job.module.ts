import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from 'models/job/job.schema';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserProfile, UserProfileSchema } from 'models/user/userProfile.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Job.name, schema: JobSchema },
    { name: UserProfile.name, schema: UserProfileSchema },
    
  ]),
  AuthModule,
],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
