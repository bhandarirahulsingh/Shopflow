import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Public Routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// 🔒 Protected Seller/Admin Routes
router.post(
    '/',
    authenticate,
    authorize('SELLER', 'ADMIN'), // Regular USERs are blocked!
    ProductController.createProduct
);

export default router;
