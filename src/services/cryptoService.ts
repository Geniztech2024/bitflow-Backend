// src/services/cryptoService.ts
import Web3 from 'web3';
import { Transaction } from 'web3-core';
import Wallet from '../models/walletModels';
import TransactionModel from '../models/Transaction';
import QRCode from 'qrcode';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_PROJECT_URL));

const contractABI = /* Your contract ABI */;
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contract = new web3.eth.Contract(contractABI, contractAddress);

export const sendCrypto = async (userId: string, recipientAddress: string, amount: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const privateKey = wallet.privateKey;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  const tx: Transaction = {
    from: account.address,
    to: recipientAddress,
    value: web3.utils.toWei(amount, 'ether'),
    gas: 21000,
  };

  const signedTx = await account.signTransaction(tx);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

  const transaction = new TransactionModel({
    user: userId,
    type: 'Send Crypto',
    amount: amount,
    status: 'Completed',
    description: `Sent ${amount} ETH to ${recipientAddress}`,
    txHash: receipt.transactionHash,
  });

  await transaction.save();

  return receipt;
};

export const receiveCrypto = async (userId: string, senderAddress: string, amount: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const receipt = {
    transactionHash: 'mockTransactionHash',
    from: senderAddress,
    to: wallet.address,
    value: amount,
  };

  const transaction = new TransactionModel({
    user: userId,
    type: 'Receive Crypto',
    amount: amount,
    status: 'Completed',
    description: `Received ${amount} ETH from ${senderAddress}`,
    txHash: receipt.transactionHash,
  });

  await transaction.save();

  return receipt;
};

export const swapCrypto = async (userId: string, fromToken: string, toToken: string, amount: string) => {
  const swapResult = await performSwap(fromToken, toToken, amount);

  const transaction = new TransactionModel({
    user: userId,
    type: 'Swap Crypto',
    amount: amount,
    status: 'Completed',
    description: `Swapped ${amount} ${fromToken} for ${toToken}`,
    txHash: swapResult.transactionHash,
  });

  await transaction.save();

  return swapResult;
};

export const tradeCrypto = async (userId: string, tradeDetails: any) => {
  const tradeResult = await executeTrade(tradeDetails);

  const transaction = new TransactionModel({
    user: userId,
    type: 'Trade Crypto',
    amount: tradeDetails.amount,
    status: 'Completed',
    description: `Traded ${tradeDetails.amount} ${tradeDetails.fromToken} for ${tradeDetails.toToken}`,
    txHash: tradeResult.transactionHash,
  });

  await transaction.save();

  return tradeResult;
};

export const p2pTrade = async (buyerId: string, sellerId: string, tradeDetails: any) => {
  const buyerWallet = await Wallet.findOne({ user: buyerId });
  const sellerWallet = await Wallet.findOne({ user: sellerId });

  if (!buyerWallet || !sellerWallet) {
    throw new Error('Wallet not found');
  }

  const tx: Transaction = {
    from: buyerWallet.address,
    to: sellerWallet.address,
    value: web3.utils.toWei(tradeDetails.amount, 'ether'),
    gas: 21000,
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, buyerWallet.privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

  const transaction = new TransactionModel({
    user: buyerId,
    type: 'P2P Trade',
    amount: tradeDetails.amount,
    status: 'Completed',
    description: `Bought ${tradeDetails.amount} ${tradeDetails.token} from user ${sellerId}`,
    txHash: receipt.transactionHash,
  });

  await transaction.save();

  return receipt;
};

export const getLiveMarketDetails = async () => {
  const marketData = await fetchLiveMarketData();
  return marketData;
};

const fetchLiveMarketData = async () => {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
      },
      params: {
        start: '1',
        limit: '100',
        convert: 'USD',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch market data from CoinMarketCap');
  }
};

const performSwap = async (fromToken: string, toToken: string, amount: string) => {
  try {
    // Assuming you will use an external API for swapping tokens, this is a mock implementation
    return {
      transactionHash: uuidv4(),
    };
  } catch (error) {
    throw new Error('Failed to perform token swap');
  }
};

const executeTrade = async (tradeDetails: any) => {
  try {
    // Assuming you will use an external API for trading tokens, this is a mock implementation
    return {
      transactionHash: uuidv4(),
    };
  } catch (error) {
    throw new Error('Failed to execute trade');
  }
};

export const generateQRCode = async (cryptoAddress: string) => {
  try {
    const qrCodeData = await QRCode.toDataURL(cryptoAddress);
    return qrCodeData;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};
