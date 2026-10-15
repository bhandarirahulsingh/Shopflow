import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Public Routes
router.get('/', ProductController.getCategories);

// 🔒 Admin-only Routes
router.post(
    '/',
    authenticate,
    authorize('ADMIN'), // Only ADMIN can create categories!
    ProductController.createCategory
);

export default router;
