import express from 'express';
import { register, verifyOTP, login, googleSignIn, googleSignInCallback, } from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/auth/google', googleSignIn);
router.get('/auth/google/callback', googleSignInCallback);


export default router;
