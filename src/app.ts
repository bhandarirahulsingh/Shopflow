import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { ApiError } from './utils/ApiError';
import { ApiResponse } from './utils/ApiResponse';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import productRoutes from './modules/product/product.routes';
import categoryRoutes from './modules/product/category.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/order/order.routes';
import paymentRoutes from './modules/payment/payment.routes';

const app: Application = express();

// 1. Core Security Middleware
app.use(helmet()); // Adds secure HTTP headers (protects against XSS, clickjacking, etc.)
app.use(cors()); // Enables Cross-Origin Resource Sharing for frontend access

// 2. Request Body Parsers
app.use(express.json({ limit: '10mb' })); // Parses incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));


// 3. Basic Health Check Route (Used by Docker, Kubernetes, and AWS to verify server is alive)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json(
        new ApiResponse(
            200,
            {
                status: 'healthy',
                serverId: process.env.SERVER_ID || 'standalone',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            'ShopFlow API is running smoothly'
        )
    );
});


// 4. API Routes will be registered here (Step 5: Auth, Products, Orders, etc.)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);

// 5. 404 Handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server!`));
});

// 6. Global Centralized Error Handler (MUST BE THE VERY LAST MIDDLEWARE!)
app.use(errorHandler);

export default app;