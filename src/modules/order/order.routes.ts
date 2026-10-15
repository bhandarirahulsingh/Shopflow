import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// 🔒 All order routes require authentication!
router.use(authenticate);

router.post('/checkout', OrderController.checkout);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);

export default router;
