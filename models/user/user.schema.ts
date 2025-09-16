import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ConfigService } from '@nestjs/config';


export enum ROLE_VALUES {
  USER = 'user',
  HR = 'hr',
}

export enum SUB_ROLE_VALUES {
  FREELANCER = 'freelancer',
  JOBSEEKER = 'jobseeker',
}

export enum INDUSTRY_VALUES {
  INFORMATION_TECHNOLOGY = 'information technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',

}

export enum COMPANY_SIZE_VALUES {
  ONE_TO_TEN = '1-10 employees',
  ELEVEN_TO_FIFTY = '11-50 employees',
  FIFTY_ONE_TO_TWO_HUNDRED = '51-200 employees',
  TWO_HUNDRED_ONE_TO_FIVE_HUNDRED = '201-500 employees',
  FIVE_HUNDRED_PLUS = '500+ employees',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    required: true,
    minlength: 8,
    select: false,
  })
  password: string;

  @Prop({ type: String, enum: ROLE_VALUES, default: ROLE_VALUES.USER })
  role: ROLE_VALUES;

  @Prop({
    type: String,
    enum: SUB_ROLE_VALUES,
    required: function (this: User) {
      return this.role === ROLE_VALUES.USER;
    },
  })
  subRole?: SUB_ROLE_VALUES;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isProfileCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String })
  resumeUrl?: string;

  @Prop({ type: String })
companyName?: string;

@Prop({ type: String })
cin?: string;

@Prop({ type: String })
companyMail?: string;

@Prop({ type: String })
companyContact?: string;

@Prop({ 
  type: String, 
  enum: INDUSTRY_VALUES
})
industry?: string;

@Prop({ 
  type: String, 
  enum: COMPANY_SIZE_VALUES
})
companySize?: string;

@Prop({ type: String })
companyAddress?: string;



  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

