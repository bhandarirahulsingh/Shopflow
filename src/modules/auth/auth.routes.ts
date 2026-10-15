import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// Public Authentication Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);

export default router;
