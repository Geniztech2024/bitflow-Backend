import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createTransaction, getTransactions } from '../controllers/transactionController';

const router = express.Router();

router.route('/').post(protect, createTransaction);
router.route('/').get(protect, getTransactions);

export default router;
