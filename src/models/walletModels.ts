import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWallet extends Document {
  user: Types.ObjectId;
  balance: number;
  createdAt: Date;
}

const walletSchema = new Schema<IWallet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;
