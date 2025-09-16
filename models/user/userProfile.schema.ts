import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Education, EducationSchema } from './education.schema';
import { Experience, ExperienceSchema } from './experience.schema';

export enum GENDER_TYPES {
    MALE = 'male',
    FEMALE = 'female',
    OTHERS = 'others',
  }


@Schema({ timestamps: true })
export class UserProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  resumeUrl: string;

  @Prop({ type: [String] })
  skills: string[];

  @Prop({ type: [String] })
  languages: string[];

  @Prop({ type: String })
  currentLocation: string;

  @Prop({ type: String })
  preferredJobLocation: string;

  @Prop({ type: String, enum: Object.values(GENDER_TYPES) })
  gender: GENDER_TYPES;

  @Prop({ type: Number })
  age: number;

  @Prop({ type: String })
  linkedinUrl: string;

  @Prop({ type: String })
  githubUrl: string;

  @Prop({ type: String })
  portfolioUrl: string;

  @Prop({ type: [EducationSchema], default: [] })
  education: Education[];

  @Prop({ type: [ExperienceSchema], default: [] })
  experience: Experience[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
