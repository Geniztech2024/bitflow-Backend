import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { sendTransactionAlert } from '../services/smsService';

export const createTransaction = async (req: Request, res: Response) => {
  const { type, amount, description } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transaction = new Transaction({
      user: req.userId,
      type,
      amount,
      description,
      status: 'Pending',
    });

    const createdTransaction = await transaction.save();

    // Send transaction alert
    await sendTransactionAlert(req.userId, `Your ${type} transaction of ${amount} is created.`);

    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
