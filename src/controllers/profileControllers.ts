import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import { sendOTPEmail } from '../services/emailService';
import OTP, { IOTP } from '../models/otpModels';
import { generateOTP } from '../utils/generateOTP';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password') as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { fullname, email } = req.body;

  try {
    const user = await User.findById(req.userId) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const submitKYC = async (req: Request, res: Response) => {
  const { documentType, country, nin } = req.body;

  try {
    const user = await User.findById(req.userId) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc = { documentType, country, nin };
    await user.save();

    res.status(200).json({ message: 'KYC submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpRecord = new OTP({ userId: user._id, otp });
    await otpRecord.save();

    await sendOTPEmail(user.email, 'Password Reset', `Your password reset code is ${otp}`);

    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ otp }) as IOTP;
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ email }) as IUser;
    if (!user || (user._id as unknown as string).toString() !== otpRecord.userId.toString()) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await OTP.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
