// paystackConfig.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const paystackServices = {
  airtime: {
    topup: (data: { phone: string; amount: number; network: string }) => 
      paystack.post('/airtime', data),
  },
  bill: {
    pay: (data: { customer: string; amount: number; provider: string; packageName?: string }) =>
      paystack.post('/bill/charges', data),
  },
  transaction: {
    initialize: (data: { email: string; amount: number; reference: string; callback_url: string; metadata: { service: string; description: string; userId: string } }) => 
      paystack.post('/transaction/initialize', data),
  },
  transfer: {
    createRecipient: (data: { type: string; name: string; account_number: string; bank_code: string; currency: string }) =>
      paystack.post('/transferrecipient', data),
    initiate: (data: { source: string; amount: number; recipient: string; reason: string }) =>
      paystack.post('/transfer', data),
  },
};

export { paystack, paystackServices };
