import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = 'bitflow';

export const getTotalTransactions = async () => {
  const db = client.db(dbName);
  return await db.collection('transactions').countDocuments({});
};

export const getTotalAmountTransacted = async () => {
  const db = client.db(dbName);
  const result = await db.collection('transactions').aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
  ]).toArray();
  return result.length ? result[0].totalAmount : 0;
};

export const getDailyTransactions = async () => {
  const db = client.db(dbName);
  return await db.collection('transactions').aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }},
    { $sort: { '_id': 1 } }
  ]).toArray();
};

export const getUserStatistics = async () => {
  const db = client.db(dbName);
  
  const totalUsers = await db.collection('users').countDocuments({});
  
  const activeUsers = await db.collection('users').countDocuments({
    lastLogin: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
  });

  const newUsers = await db.collection('users').countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
  });

  return { totalUsers, activeUsers, newUsers };
};
