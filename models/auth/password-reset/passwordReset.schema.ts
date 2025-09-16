import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PasswordReset extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  token: string;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

// TTL index to auto-delete expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


