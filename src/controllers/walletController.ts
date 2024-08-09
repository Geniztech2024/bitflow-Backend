import { Request, Response } from 'express';
import Wallet from '../models/walletModels';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { paystackServices } from '../config/paystackConfig';
import { sendTransactionAlert } from '../services/smsService'; // Import the notification service

// Fetch the balance (excluding crypto balances)
export const getBalance = async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOne({ user: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Deposit funds via debit card
export const deposit = async (req: Request, res: Response) => {
  const { amount, cardDetails } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Process deposit via card (Placeholder for actual payment processing logic)
    const paymentResult = await paystackServices.chargeCard(amount, cardDetails); // Placeholder function

    if (paymentResult.status !== 'success') {
      return res.status(400).json({ message: 'Deposit failed' });
    }

    wallet.balance += amount;

    const transaction = new Transaction({
      user: req.userId,
      type: 'Deposit',
      amount,
      currency: 'fiat',
      status: 'Completed',
      description: 'Funds deposited via card',
    });

    await transaction.save();
    await wallet.save();

    // Send transaction alert
    await sendTransactionAlert(req.userId, `Deposited ${amount} via card`);

    res.status(200).json({ message: 'Deposit successful', balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Withdraw funds (excluding crypto)
export const withdraw = async (req: Request, res: Response) => {
  const { amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;

    const transaction = new Transaction({
      user: req.userId,
      type: 'Withdrawal',
      amount,
      currency: 'fiat',
      status: 'Completed',
      description: 'Funds withdrawn',
    });

    await transaction.save();
    await wallet.save();

    // Send transaction alert
    await sendTransactionAlert(req.userId, `Withdrew ${amount}`);

    res.status(200).json({ message: 'Withdrawal successful', balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Transfer funds between users (excluding crypto)
export const transferFunds = async (req: Request, res: Response) => {
  const { recipientEmail, amount } = req.body;

  if (amount <= 0) {
    return res.status (400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const senderWallet = await Wallet.findOne({ user: req.userId });
    if (!senderWallet) {
      return res.status(404).json({ message: 'Sender wallet not found' });
    }

    const recipientUser = await User.findOne({ email: recipientEmail });
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const recipientWallet = await Wallet.findOne({ user: recipientUser._id });
    if (!recipientWallet) {
      return res.status(404).json({ message: 'Recipient wallet not found' });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    const senderTransaction = new Transaction({
      user: req.userId,
      type: 'Transfer Out',
      amount,
      currency: 'fiat',
      status: 'Completed',
      description: `Transfer to ${recipientEmail}`,
    });

    const recipientTransaction = new Transaction({
      user: recipientUser._id,
      type: 'Transfer In',
      amount,
      currency: 'fiat',
      status: 'Completed',
      description: `Transfer from ${req.userId}`,
    });

    await senderTransaction.save();
    await recipientTransaction.save();
    await senderWallet.save();
    await recipientWallet.save();

    // Send transaction alerts
    await sendTransactionAlert(req.userId, `Transferred ${amount} to ${recipientEmail}`);
    await sendTransactionAlert(recipientUser._id, `Received ${amount} from ${req.userId}`);

    res.status(200).json({ message: 'Transfer successful', balance: senderWallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Pay utility bill
export const payUtilityBill = async (req: Request, res: Response) => {
  const { billType, amount, accountNumber } = req.body;

  try {
    const wallet = await Wallet.findOne({ user: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Process utility payment (Placeholder for actual payment processing logic)
    const paymentResult = await payUtilityBill(billType, amount, accountNumber); // Placeholder function

    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    wallet.balance -= amount;

    const transaction = new Transaction({
      user: req.userId,
      type: 'Utility Bill Payment',
      amount,
      currency: 'fiat',
      status: 'Completed',
      description: `Paid ${billType} bill`,
    });

    await transaction.save();
    await wallet.save();

    // Send transaction alert
    await sendTransactionAlert(req.userId, `Paid ${amount} for ${billType} bill`);

    res.status(200).json({ message: 'Payment successful', balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
