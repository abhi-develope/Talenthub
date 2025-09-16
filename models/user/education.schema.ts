import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false }) // No separate ID needed inside array
export class Education extends Document {
  @Prop({ type: String, required: true })
  degree: string;

  @Prop({ type: String, required: true })
  institution: string;

  @Prop({ type: String })
  fieldOfStudy: string;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Boolean, default: false })
  currentlyStudying: boolean;

  @Prop({ type: String })
  grade: string;

  @Prop({ type: String })
  description: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);
