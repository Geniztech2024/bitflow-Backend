import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileControllers';
import { protect } from '../middleware/authMiddleware';
import { validateUpdateProfile, validateChangePassword } from '../middleware/validateRequest';

const router = Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, validateUpdateProfile, updateProfile);

router.put('/profile/change-password', protect, validateChangePassword, changePassword);

export default router;
