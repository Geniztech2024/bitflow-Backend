import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  pushToken?: string;
  phoneNumber?: string,
  isVerified: boolean;
  kyc: {
    documentType: string;
    country: string;
    nin: string;
  };
}

const userSchema: Schema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: false }, // Add this line
  pushToken: { type: String },
  isVerified: { type: Boolean, default: false },
  kyc: {
    documentType: { type: String, enum: ['NIN'], default: 'NIN' },
    country: { type: String },
    nin: { type: String },
  },
});


export default mongoose.model<IUser>('User', userSchema);
