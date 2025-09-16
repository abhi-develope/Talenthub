import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum JOB_TYPE_VALUES {
  FULL_TIME = 'full time',
  PART_TIME = 'part time',
  CONTRACT = 'contract',
}

export enum WORK_MODE_VALUES {
  REMOTE = 'remote',
  ON_SITE = 'on site',
  HYBRID = 'hybrid',
}

export enum DEPARTMENT_VALUES {
  SUPPORT = 'support',
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  MARKETING = 'marketing',
  SALES = 'sales',
  HR = 'hr',
  FINANCE = 'finance',
  OTHER = 'other',
}

export enum VISIBILITY_VALUES {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum EXPERIENCE_VALUES {
  FRESHER = '0-1 years',
  ONE_TO_TWO = '1-2 years',
  TWO_TO_FIVE = '2-5 years',
  FIVE_TO_TEN = '5-10 years',
  TEN_PLUS = '10+ years',
}

export enum NOTICE_PERIOD_VALUES {
  IMMEDIATE = 'immediate',
  ONE_MONTH = '1 month',
  TWO_MONTHS = '2 months',
  THREE_MONTHS = '3 months',
  NEGOTIABLE = 'negotiable',
}

export enum COUNTRY_VALUES {
  INDIA = 'India',
  USA = 'USA',
  UK = 'UK',
  CANADA = 'Canada',
  AUSTRALIA = 'Australia',
  OTHER = 'Other',
}

export enum STATE_VALUES {
  DELHI = 'Delhi',
  MAHARASHTRA = 'Maharashtra',
  KARNATAKA = 'Karnataka',
  CALIFORNIA = 'California',
  NEW_YORK = 'New York',
  OTHER = 'Other',
}

export enum CITY_VALUES {
  DELHI = 'Delhi',
  MUMBAI = 'Mumbai',
  BANGALORE = 'Bangalore',
  SAN_FRANCISCO = 'San Francisco',
  NEW_YORK_CITY = 'New York City',
  OTHER = 'Other',
}


export enum EDUCATION_VALUES {
  HIGH_SCHOOL = 'High School',
  BACHELORS = 'Bachelors',
  MASTERS = 'Masters',
  PHD = 'PhD',
  DIPLOMA = 'Diploma',
  OTHER = 'Other',
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: String, required: true })
  jobTitle: string;

  @Prop({ type: String, enum: JOB_TYPE_VALUES, required: true })
  jobType: JOB_TYPE_VALUES;

  @Prop({ type: String, enum: WORK_MODE_VALUES, required: true })
  workMode: WORK_MODE_VALUES;

  @Prop({ type: String, enum: DEPARTMENT_VALUES, required: true })
  department: DEPARTMENT_VALUES;

  @Prop({ type: Date, required: true })
  jobExpiry: Date;

  @Prop({ type: String, enum: VISIBILITY_VALUES, default: VISIBILITY_VALUES.PUBLIC })
  visibility: VISIBILITY_VALUES;

  @Prop({ type: String, enum: EXPERIENCE_VALUES, required: true })
  experience: EXPERIENCE_VALUES;

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    required: true,
  })
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };

  @Prop({
    type: {
      country: { type: String, enum: COUNTRY_VALUES, required: true },
      state: { type: String, enum: STATE_VALUES, required: true },
      city: { type: String, enum: CITY_VALUES, required: true },
    },
    required: true,
  })
  jobLocation: {
    country: COUNTRY_VALUES;
    state: STATE_VALUES;
    city: CITY_VALUES;
  };

  @Prop({ type: Number, required: true, default: 1 })
  numberOfOpenings: number;

  @Prop({ type: String, enum: NOTICE_PERIOD_VALUES, required: true })
  noticePeriod: NOTICE_PERIOD_VALUES;

  
  @Prop({ type: [String], required: true })
  skills: string[]; // Example: ['React', 'Node.js', 'MongoDB']

  @Prop({ type: String, enum: EDUCATION_VALUES, required: true })
  education: EDUCATION_VALUES;

  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
