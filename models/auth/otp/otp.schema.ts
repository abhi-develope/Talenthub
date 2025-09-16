import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'models/user/user.schema';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  otpCode: string;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index to auto-delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
