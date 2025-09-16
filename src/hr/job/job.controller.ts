import { Controller, Post, Get, Param, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDTO, CreateJobResponseDTO, JobResponseDTO } from './dto';
import { PaginationQueryDTO, PaginationResponse } from 'src/common/pagination/pagination.dto';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { ROLE_VALUES } from 'models/user/user.schema';
import { Roles } from 'src/auth/decorators';


@ApiTags('Jobs')
@Controller('hr/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_VALUES.HR)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, type: CreateJobResponseDTO })
  async create(@Body() dto: CreateJobDTO) {
    return this.jobService.createJob(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with pagination, filtering, and search' })
  @ApiResponse({ status: 200, type: PaginationResponse<JobResponseDTO> })
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
  @ApiResponse({ status: 200, type: JobResponseDTO })
  async findOne(@Param('id') id: string) {
    return this.jobService.getJobById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  @ApiResponse({ status: 200, type: JobResponseDTO })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateJobDTO>) {
    return this.jobService.updateJob(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  async remove(@Param('id') id: string) {
    return this.jobService.deleteJob(id);
  }
}
