import express from 'express';
import { getBalance, deposit, withdraw, transferFunds, payUtilityBill } from '../controllers/walletController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/balance', authenticate, getBalance);
router.post('/deposit', authenticate, deposit);
router.post('/withdraw', authenticate, withdraw);
router.post('/transfer', authenticate, transferFunds);
router.post('/pay-bill', authenticate, payUtilityBill);

export default router;
