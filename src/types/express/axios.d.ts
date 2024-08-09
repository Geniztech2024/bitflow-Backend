// src/types/axios.d.ts
import 'axios';

declare module 'axios' {
  interface PaystackAirtimeResponse {
    status: boolean;
    message: string;
    data: {
      reference: string;
      status: string;
      transaction: string;
      amount: number;
      recipient: string;
    };
  }

  interface PaystackBillResponse {
    status: boolean;
    message: string;
    data: {
      reference: string;
      status: string;
      transaction: string;
      amount: number;
      customer: string;
      provider: string;
    };
  }

  interface TransactionResponse {
    status: boolean;
    message: string;
    data: {
      email: string;
      reference: string;
      status: string;
      amount: number;
      authorization_url: string;
    };
  }

  interface AirtimeTopupData {
    phone: string;
    amount: number;
    network: string;
  }

  interface BillPaymentData {
    customer: string;
    amount: number;
    provider: string;
    package?: string; // assuming package is an optional field for DSTV payment
    // add other known optional properties here
  }

  interface TransactionData {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
    metadata: {
      service: string;
      description: string;
      userId: string;
    };
  }

  interface AxiosInstance {
    airtime: {
      topup: (data: AirtimeTopupData) => Promise<PaystackAirtimeResponse>;
    };
    bill: {
      pay: (data: BillPaymentData) => Promise<PaystackBillResponse>;
    };
    transaction: {
      initialize: (data: TransactionData) => Promise<TransactionResponse>;
    };
  }
}
