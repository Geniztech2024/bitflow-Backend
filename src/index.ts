import express, { Application } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import profileRoutes from './routes/profileRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import walletRoutes from './routes/walletRoutes';
import reportRoutes from './routes/reportRoutes';
import utilityRoutes from './routes/utilityRoutes'
import adminRoutes from './routes/adminRoutes';
import './config/passportConfig';
import passport from 'passport';

dotenv.config();

const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(passport.initialize());


// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/admin', adminRoutes);



// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
