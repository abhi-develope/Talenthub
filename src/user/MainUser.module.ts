import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JobModule } from './job/job.module';
import { UserModule } from './user-profile/user.module';

@Module({
  imports: [AuthModule, JobModule, UserModule],
  controllers: [],
  providers: [],
})
export class MainUserModule {}
