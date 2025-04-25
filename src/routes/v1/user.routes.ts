import { Router } from 'express';
import { signup, login, forgetPassword, sendOTP, verifyOTP,getProfile, updateProfile} from '../../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware'
import { getUserProfile } from '../../services/user.service';

const router = Router();

router.post('/api/v1/signup', signup);
router.post('/api/v1/login', login);
router.post('/api/v1/forget-password', forgetPassword);
router.post('/api/v1/send-otp', sendOTP);
router.post('/api/v1/verify-otp', verifyOTP);
router.get('/api/v1/profile', authMiddleware, getProfile);
router.patch('/api/v1/profile', authMiddleware, updateProfile);


export default router;
