import twilio from 'twilio';
import axios from 'axios';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
const twilioPushServiceSid = process.env.TWILIO_PUSH_SERVICE_SID!;
const twilioPushUrl = `https://push.twilio.com/v1/Services/${twilioPushServiceSid}/Notifications`;

const client = twilio(accountSid, authToken);

export const sendOTPSMS = async (phoneNumber: string, otp: string) => {
  try {
    const message = `Your OTP code is: ${otp}`;

    const response = await client.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: phoneNumber,
    });

    if (!response.sid) {
      throw new Error('Failed to send OTP SMS');
    }
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    throw new Error('Failed to send OTP SMS');
  }
};

export const sendPushNotification = async (title: string, body: string, userId: string) => {
  try {
    const response = await axios.post(
      twilioPushUrl,
      {
        identity: userId,
        body: body,
        title: title,
      },
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
      }
    );

    if (response.status !== 201) {
      throw new Error('Failed to send push notification');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error('Failed to send push notification');
  }
};

// Example function to send transaction alert
export const sendTransactionAlert = async (userId: string, message: string) => {
  await sendPushNotification('Transaction Alert', message, userId);
};

// Example function to send crypto update
export const sendCryptoUpdate = async (userId: string, message: string) => {
  await sendPushNotification('Crypto Update', message, userId);
};

// New function to send generic notifications
export const sendNotification = async ({ email, phoneNumber, pushToken, message, subject }: 
    { email: string; phoneNumber: string; pushToken: string; message: string; subject: string; }) => {
  if (phoneNumber) {
    await sendOTPSMS(phoneNumber, message);
  }
  if (pushToken) {
    await sendPushNotification(subject, message, pushToken);
  }
};
