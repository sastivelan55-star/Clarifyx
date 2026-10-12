import { Router } from 'express';
import { validate } from '../middleware/validate';
import { register, login, logout, getMe, registerSchema, loginSchema } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', generalLimiter, validate(registerSchema), register);
router.post('/login', generalLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
