import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import passport from 'passport';
import User from '../models/User';
import OTP from '../models/otpModels';
import Wallet from '../models/walletModels';
import { sendOTPSMS } from '../services/smsService';
import { generateOTP } from '../utils/generateOTP';

export const register = async (req: Request, res: Response) => {
  const { fullname, email, password, confirmPassword, gender, pushToken } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExists = await User.findOne({ email }).session(session);

    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      gender,
      pushToken,
    });

    await user.save({ session });

    const otp = generateOTP();
    const otpRecord = new OTP({ userId: user._id, otp });
    await otpRecord.save({ session });

    // Use optional chaining in case phoneNumber is not defined in the user schema
    if (user.phoneNumber) {
      await sendOTPSMS(user.phoneNumber, otp); // Send OTP to phone number
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'User registered, please check your phone for OTP' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ _id: otpRecord.userId });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Phone number not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await Wallet.create({ user: user._id, balance: 0 });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleSignIn = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleSignInCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: '/login', session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect('/login');
    }
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return res.send(loginErr);
      }
      // Generate token or handle successful sign-in
      res.redirect('/');
    });
  })(req, res, next);
};
