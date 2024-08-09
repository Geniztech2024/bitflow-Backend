import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  otp: string;
  createdAt: Date;
}

const otpSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
});

export default mongoose.model<IOTP>('OTP', otpSchema);
