import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'models/job/job.schema';
import { PaginationQueryDTO, PaginationResponse } from 'src/common/pagination/pagination.dto';
import { UserProfile } from 'models/user/userProfile.schema';
import { UserJobResponseDTO } from './dto';


@Injectable()
export class JobService {
  constructor(
  @InjectModel(Job.name) private readonly jobModel: Model<Job>,
   @InjectModel(UserProfile.name) private readonly userProfileModel: Model<UserProfile>) {}

 

  async getAllJobs(
    pagination: PaginationQueryDTO,
    filters: Record<string, any>,
    search?: string,
  ): Promise<PaginationResponse<UserJobResponseDTO>> {
    const { page, limit, sort } = pagination;
    const query: any = { ...filters };
  
    //  Search jobTitle
    if (search) {
      query.jobTitle = { $regex: search, $options: 'i' };
    }
  
    const skip = (page - 1) * limit;
  
    //  Sorting
    let sortQuery: any = { createdAt: -1 }; // default
    if (sort) {
      const [field, order] = sort.split(':');
      sortQuery = { [field]: order === 'asc' ? 1 : -1 };
    }
  
    const [jobs, total] = await Promise.all([
      this.jobModel.find(query).sort(sortQuery).skip(skip).limit(limit).exec(),
      this.jobModel.countDocuments(query),
    ]);
  
    const transformed = jobs.map((job) =>
      UserJobResponseDTO.transform(job.toObject()),
    );
  
    return new PaginationResponse<UserJobResponseDTO>(
      transformed,
      total,
      page,
      limit,
    );
  }
  

  async getJobById(id: string): Promise<UserJobResponseDTO> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) throw new NotFoundException('Job not found');
    return UserJobResponseDTO.transform(job.toObject());
  }


  async getRecommendedJobs(userId: string): Promise<UserJobResponseDTO[]> {
    const user = await this.userProfileModel.findOne({ userId }).exec();
    if (!user) throw new NotFoundException('User profile not found');
  
    const jobs = await this.jobModel.find().exec();
  
    // Filter jobs based on skills, education, experience
    const recommended = jobs.filter(job => {
      const skillMatch = job.skills.filter(skill =>
        user.skills.includes(skill),
      ).length;
  
      const skillMatchPercentage =
        (skillMatch / job.skills.length) * 100;
  
      return (
        skillMatchPercentage >= 60 && // at least 60% skills match
        job.education === user.education[0]?.degree 
      );
    });
  
    return recommended.map(job => UserJobResponseDTO.transform(job.toObject()));
  }
  
  async getPreferenceJobs(userId: string): Promise<UserJobResponseDTO[]> {
    const user = await this.userProfileModel.findOne({ userId }).exec();
    if (!user) throw new NotFoundException('User profile not found');
  
    const jobs = await this.jobModel.find({
      'jobLocation.city': user.preferredJobLocation,
      department: { $in: user.skills }, // optional filtering
    }).exec();
  
    return jobs.map(job => UserJobResponseDTO.transform(job.toObject()));
  }
  


  async getYouMightLikeJobs(userId: string): Promise<UserJobResponseDTO[]> {
    const user = await this.userProfileModel.findOne({ userId }).exec();
    if (!user) throw new NotFoundException('User profile not found');
  
    const jobs = await this.jobModel.find().exec();
  
    const liked = jobs.filter(job => {
      const skillOverlap = job.skills.some(skill =>
        user.skills.includes(skill),
      );
      return skillOverlap; // looser filter
    });
  
    return liked.map(job => UserJobResponseDTO.transform(job.toObject()));
  }
  

  
}
