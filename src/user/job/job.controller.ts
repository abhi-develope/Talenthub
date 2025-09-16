import { Controller, Post, Get, Param, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobService } from './job.service';
import {  UserJobResponseDTO } from './dto';
import { PaginationQueryDTO, PaginationResponse } from 'src/common/pagination/pagination.dto';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { ROLE_VALUES } from 'models/user/user.schema';
import { Roles } from 'src/auth/decorators';


@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_VALUES.USER)
export class JobController {
  constructor(private readonly jobService: JobService) {}

 

  @Get()
  @ApiOperation({ summary: 'Get all jobs with pagination, filtering, and search' })
  @ApiResponse({ status: 200, type: PaginationResponse<UserJobResponseDTO> })
  async findAll(
    @Query() pagination: PaginationQueryDTO,
    @Query() query: Record<string, any>,
  ) {
    const { search, ...filters } = query;
  
    delete filters.page;
    delete filters.limit;
    delete filters.sort;
  
    return this.jobService.getAllJobs(pagination, filters, search);
  }
  

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, type: UserJobResponseDTO })
  async findOne(@Param('id') id: string) {
    return this.jobService.getJobById(id);
  }


  @Get('recommendations/:userId')
async getRecommendations(@Param('userId') userId: string) {
  return this.jobService.getRecommendedJobs(userId);
}

@Get('preferences/:userId')
async getPreferenceJobs(@Param('userId') userId: string) {
  return this.jobService.getPreferenceJobs(userId);
}

@Get('might-like/:userId')
async getYouMightLikeJobs(@Param('userId') userId: string) {
  return this.jobService.getYouMightLikeJobs(userId);
}


 
}
