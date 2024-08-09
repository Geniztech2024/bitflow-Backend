import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { airtimeTopUp, payElectricityBill, payDSTVBill, paySportsBet } from '../controllers/utilityControllers';

const router = express.Router();

router.route('/airtime').post(protect, airtimeTopUp);
router.route('/electricity').post(protect, payElectricityBill);
router.route('/dstv').post(protect, payDSTVBill);
router.route('/sportsbet').post(protect, paySportsBet);


export default router;
