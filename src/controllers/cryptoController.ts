import { Request, Response } from 'express';
import Wallet from '../models/walletModels';
import Transaction from '../models/Transaction';
import { sendTransactionAlert, sendCryptoUpdate } from '../services/smsService';
import { sendCrypto, receiveCrypto, swapCrypto, getLiveMarketDetails, tradeCrypto, generateQRCode } from '../services/cryptoService';

export const getBalance = async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOne({ user: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const cryptoBalances = await getLiveMarketDetails(); // Fetches live market data from CoinMarketCap

    res.status(200).json({ cryptoBalances });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendCryptoController = async (req: Request, res: Response) => {
  const { recipientAddress, amount } = req.body;

  try {
    const receipt = await sendCrypto(req.userId, recipientAddress, amount);
    await sendTransactionAlert(req.userId, `Sent ${amount} ETH to ${recipientAddress}`);
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const receiveCryptoController = async (req: Request, res: Response) => {
  const { senderAddress, amount } = req.body;

  try {
    const receipt = await receiveCrypto(req.userId, senderAddress, amount);
    await sendTransactionAlert(req.userId, `Received ${amount} ETH from ${senderAddress}`);
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const swapCryptoController = async (req: Request, res: Response) => {
  const { fromToken, toToken, amount } = req.body;

  try {
    const swapResult = await swapCrypto(req.userId, fromToken, toToken, amount);
    await sendTransactionAlert(req.userId, `Swapped ${amount} ${fromToken} for ${toToken}`);
    res.status(200).json(swapResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleTradeCrypto = async (req: Request, res: Response) => {
  const { tradeDetails } = req.body;
  try {
    const tradeResult = await tradeCrypto(req.userId, tradeDetails);
    await sendTransactionAlert(req.userId, `Executed trade: ${tradeDetails}`);
    res.status(200).json(tradeResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetLiveMarketDetails = async (req: Request, res: Response) => {
  try {
    const marketData = await getLiveMarketDetails(); // Now retrieves data from CoinMarketCap
    await sendCryptoUpdate(req.userId, 'Fetched live market details');
    res.status(200).json(marketData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGenerateQRCode = async (req: Request, res: Response) => {
  try {
    const qrCodeData = await generateQRCode(req.userId);
    res.status(200).json(qrCodeData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
