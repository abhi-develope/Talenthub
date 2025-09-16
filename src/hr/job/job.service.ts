import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'models/job/job.schema';
import { CreateJobDTO, CreateJobResponseDTO, JobResponseDTO } from './dto';
import { PaginationQueryDTO, PaginationResponse } from 'src/common/pagination/pagination.dto';


@Injectable()
export class JobService {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<Job>) {}

  async createJob(data: CreateJobDTO): Promise<CreateJobResponseDTO> {
    const newJob = await this.jobModel.create(data);
    const response = JobResponseDTO.transform(newJob.toObject());
    return {
      error: false,
      msg: 'Job created successfully',
      statusCode: HttpStatus.CREATED,
      data: response,
    };
  }

  async getAllJobs(
    pagination: PaginationQueryDTO,
    filters: Record<string, any>,
    search?: string,
  ): Promise<PaginationResponse<JobResponseDTO>> {
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
      JobResponseDTO.transform(job.toObject()),
    );
  
    return new PaginationResponse<JobResponseDTO>(
      transformed,
      total,
      page,
      limit,
    );
  }
  

  async getJobById(id: string): Promise<JobResponseDTO> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) throw new NotFoundException('Job not found');
    return JobResponseDTO.transform(job.toObject());
  }

  async updateJob(id: string, data: Partial<CreateJobDTO>): Promise<JobResponseDTO> {
    const job = await this.jobModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!job) throw new NotFoundException('Job not found');
    return JobResponseDTO.transform(job.toObject());
  }

  async deleteJob(id: string): Promise<{ msg: string }> {
    const result = await this.jobModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Job not found');
    return { msg: 'Job deleted successfully' };
  }
}
