import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Experience extends Document {
  @Prop({ type: String, required: true })
  jobTitle: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Boolean, default: false })
  currentlyWorking: boolean;

  @Prop({ type: String })
  employmentType: string; // Full-time, Part-time, Contract etc.

  @Prop({ type: String })
  description: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);
