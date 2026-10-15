import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// 🔒 All cart routes require authentication!
// router.use(authenticate) automatically applies the middleware to all routes in this file!
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.patch('/items/:itemId', CartController.updateQuantity);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
