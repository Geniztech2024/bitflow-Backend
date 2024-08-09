import express from 'express';
import { getBalance, sendCryptoController, receiveCryptoController, swapCryptoController } from '../controllers/cryptoController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/balance', authenticate, getBalance);
router.post('/send', authenticate, sendCryptoController);
router.post('/receive', authenticate, receiveCryptoController);
router.post('/swap', authenticate, swapCryptoController);

export default router;
