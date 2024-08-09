import { Request, Response } from 'express';
import { getTotalTransactions, getTotalAmountTransacted, getDailyTransactions, getUserStatistics } from '../services/reportService';

export const getTransactionReport = async (req: Request, res: Response) => {
  try {
    const totalTransactions = await getTotalTransactions();
    const totalAmount = await getTotalAmountTransacted();
    const dailyTransactions = await getDailyTransactions();

    res.status(200).json({ totalTransactions, totalAmount, dailyTransactions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction report', error });
  }
};

export const getUserReport = async (req: Request, res: Response) => {
  try {
    const userStatistics = await getUserStatistics();

    res.status(200).json(userStatistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user report', error });
  }
};
