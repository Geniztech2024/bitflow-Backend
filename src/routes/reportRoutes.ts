import { Router } from 'express';
import { getTransactionReport, getUserReport } from '../controllers/reportController';

const router = Router();

router.get('/transactions', getTransactionReport);
router.get('/users', getUserReport);

export default router;
