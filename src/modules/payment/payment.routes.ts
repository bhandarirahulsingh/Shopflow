import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// 🔒 All payment routes require authentication!
router.use(authenticate);

router.post('/process', PaymentController.processPayment);
router.get('/order/:orderId', PaymentController.getPaymentByOrderId);

export default router;
