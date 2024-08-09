
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUtilityTransaction extends Document {
  user: Types.ObjectId;
  type: string;
  amount: number;
  status: string;
  description?: string;
  service: string;
  createdAt: Date;
}

const utilityTransactionSchema = new Schema<IUtilityTransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  description: { type: String },
  service: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UtilityTransaction = mongoose.model<IUtilityTransaction>('UtilityTransaction', utilityTransactionSchema);

export default UtilityTransaction;
