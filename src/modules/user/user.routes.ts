import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// 🔒 All user routes require authentication!
router.get('/me', authenticate, UserController.getMe);

export default router;
