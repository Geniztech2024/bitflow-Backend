import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document { // Export the IAdmin interface
  email: string;
  password: string;
  role: 'superadmin' | 'admin';
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'admin'] },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
