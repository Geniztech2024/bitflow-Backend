import { Request, Response } from 'express';
import Wallet from '../models/walletModel';
import UtilityTransaction from '../models/UtilityTransaction';
import { paystackServices } from '../config/paystackConfig';
import { sendNotification } from '../services/smsService'; // Assuming sendNotification is in smsService

export const notifyUser = async (req: Request, res: Response) => {
  const { email, phoneNumber, pushToken, message, subject } = req.body;

  try {
    await sendNotification({ email, phoneNumber, pushToken, message, subject });
    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notifications', error });
  }
};

export const airtimeTopUp = async (req: Request, res: Response) => {
  const { amount, phoneNumber, network } = req.body;

  if (!amount || !phoneNumber || !network) {
    return res.status(400).json({ message: 'Amount, phone number, and network are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentResponse = await paystackServices.airtime.topup({
      phone: phoneNumber,
      amount: amount * 100, // Convert to kobo
      network,
    });

    if (paymentResponse.data.status) {
      wallet.balance -= amount;

      const transaction = new UtilityTransaction({
        user: req.user.id,
        type: 'Airtime Top-up',
        amount: amount,
        status: 'Completed',
        description: `Top-up for ${phoneNumber}`,
        service: 'Airtime',
      });

      await transaction.save();
      await wallet.save();

      // Send notification to user
      await sendNotification({
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        message: `Your airtime top-up of ${amount} was successful.`,
        subject: 'Airtime Top-up Successful',
      });

      res.status(200).json({
        message: 'Airtime top-up successful',
        balance: wallet.balance,
        transactionId: transaction._id,
      });
    } else {
      res.status(400).json({ message: 'Airtime top-up failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const payElectricityBill = async (req: Request, res: Response) => {
  const { amount, meterNumber, provider } = req.body;

  if (!amount || !meterNumber || !provider) {
    return res.status(400).json({ message: 'Amount, meter number, and provider are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentResponse = await paystackServices.bill.pay({
      customer: meterNumber,
      amount: amount * 100, // Convert to kobo
      provider,
    });

    if (paymentResponse.data.status) {
      wallet.balance -= amount;

      const transaction = new UtilityTransaction({
        user: req.user.id,
        type: 'Electricity Payment',
        amount: amount,
        status: 'Completed',
        description: `Payment for meter number ${meterNumber}`,
        service: 'Electricity',
      });

      await transaction.save();
      await wallet.save();

      // Send notification to user
      await sendNotification({
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        message: `Your electricity bill payment of ${amount} was successful.`,
        subject: 'Electricity Bill Payment Successful',
      });

      res.status(200).json({
        message: 'Electricity bill payment successful',
        balance: wallet.balance,
        transactionId: transaction._id,
      });
    } else {
      res.status(400).json({ message: 'Electricity bill payment failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const payDSTVBill = async (req: Request, res: Response) => {
  const { amount, smartCardNumber, packageType } = req.body;

  if (!amount || !smartCardNumber || !packageType) {
    return res.status(400).json({ message: 'Amount, smart card number, and package type are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentResponse = await paystackServices.bill.pay({
      customer: smartCardNumber,
      amount: amount * 100, // Convert to kobo
      provider: 'dstv', // Assume 'dstv' is the provider identifier for DSTV in Paystack
      packageName: packageType,
    });

    if (paymentResponse.data.status) {
      wallet.balance -= amount;

      const transaction = new UtilityTransaction({
        user: req.user.id,
        type: 'DSTV Payment',
        amount: amount,
        status: 'Completed',
        description: `Payment for DSTV package ${packageType} for smart card ${smartCardNumber}`,
        service: 'DSTV',
      });

      await transaction.save();
      await wallet.save();

      // Send notification to user
      await sendNotification({
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        message: `Your DSTV bill payment of ${amount} was successful.`,
        subject: 'DSTV Bill Payment Successful',
      });

      res.status(200).json({
        message: 'DSTV bill payment successful',
        balance: wallet.balance,
        transactionId: transaction._id,
      });
    } else {
      res.status(400).json({ message: 'DSTV bill payment failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const paySportsBet = async (req: Request, res: Response) => {
  const { amount, betAccount, provider } = req.body;
  const supportedProviders = ['sporty', '1xbet', '22bet', 'betano', 'bet9ja'];

  if (!amount || !betAccount || !provider) {
    return res.status(400).json({ message: 'Amount, bet account, and provider are required' });
  }

  if (!supportedProviders.includes(provider.toLowerCase())) {
    return res.status(400).json({ message: 'Unsupported sports bet provider' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentResponse = await paystackServices.bill.pay({
      customer: betAccount,
      amount: amount * 100, // Convert to kobo
      provider,
    });

    if (paymentResponse.data.status) {
      wallet.balance -= amount;

      const transaction = new UtilityTransaction({
        user: req.user.id,
        type: 'Sports Bet Payment',
        amount: amount,
        status: 'Completed',
        description: `Payment for ${provider} account ${betAccount}`,
        service: 'Sports Bet',
      });

      await transaction.save();
      await wallet.save();

      // Send notification to user
      await sendNotification({
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        message: `Your sports bet payment of ${amount} was successful.`,
        subject: 'Sports Bet Payment Successful',
      });

      res.status(200).json({
        message: 'Sports bet payment successful',
        balance: wallet.balance,
        transactionId: transaction._id,
      });
    } else {
      res.status(400).json({ message: 'Sports bet payment failed' });
    }
  } catch (error) {
    res.status (500).json({ message: 'Server error' });
  }
};

export const payCableTVBill = async (req: Request, res: Response) => {
  const { amount, smartCardNumber, provider, packageType } = req.body;
  const supportedProviders = ['dstv', 'gotv', 'netflix', 'startimes', 'showmax'];

  if (!amount || !smartCardNumber || !provider || !packageType) {
    return res.status(400).json({ message: 'Amount, smart card number, provider, and package type are required' });
  }

  if (!supportedProviders.includes(provider.toLowerCase())) {
    return res.status(400).json({ message: 'Unsupported cable TV provider' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentResponse = await paystackServices.bill.pay({
      customer: smartCardNumber,
      amount: amount * 100, // Convert to kobo
      provider,
      packageName: packageType,
    });

    if (paymentResponse.data.status) {
      wallet.balance -= amount;

      const transaction = new UtilityTransaction({
        user: req.user.id,
        type: 'Cable TV Payment',
        amount: amount,
        status: 'Completed',
        description: `Payment for ${provider} package ${packageType} for smart card ${smartCardNumber}`,
        service: 'Cable TV',
      });

      await transaction.save();
      await wallet.save();

      // Send notification to user
      await sendNotification({
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        message: `Your ${provider} bill payment of ${amount} was successful.`,
        subject: `${provider} Bill Payment Successful`,
      });

      res.status(200).json({
        message: `${provider} bill payment successful`,
        balance: wallet.balance,
        transactionId: transaction._id,
      });
    } else {
      res.status(400).json({ message: `${provider} bill payment failed` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
