import { Router } from 'express';
import { adminLogin, createAdmin } from '../controllers/adminControllers';
import { protect } from '../middleware/authMiddleware';
import { isSuperAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.post('/login', adminLogin);
router.post('/create', protect, isSuperAdmin, createAdmin);

export default router;
