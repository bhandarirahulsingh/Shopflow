import { query, withTransaction } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { CheckoutInput } from './order.schema';
import { InventoryService } from '../inventory/inventory.service';

export interface OrderItemResponse {
    id: number;
    productId: number;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}
export interface OrderResponse {
    id: number;
    orderNumber: string;
    userId: number;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    shippingAddress: any;
    items: OrderItemResponse[];
    createdAt: Date;
}

export class OrderService {
    // 1. ATOMIC CHECKOUT: CART ──► ORDER
    static async checkout(userId: number, input: CheckoutInput): Promise<OrderResponse> {
        const { shippingAddress } = input;
        return await withTransaction(async (client) => {
            // Step A: Get user's cart
            const cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
            if (cartResult.rows.length === 0) {
                throw ApiError.badRequest('Cart is empty');
            }
            const cartId = cartResult.rows[0].id;
            // Step B: Get all cart items
            const itemsResult = await client.query(
                `SELECT ci.product_id as "productId", ci.quantity, p.name as "productTitle", p.price, p.is_active as "isActive"
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
                [cartId]
            );
            if (itemsResult.rows.length === 0) {
                throw ApiError.badRequest('Your shopping cart is empty');
            }
            const cartItems = itemsResult.rows;
            // Step C: Verify product availability & Calculate total
            let calculatedTotal = 0;
            for (const item of cartItems) {
                if (!item.isActive) {
                    throw ApiError.badRequest(`Product '${item.productTitle}' is no longer available`);
                }
                calculatedTotal += parseFloat(item.price) * item.quantity;
            }
            let finalTotal = Math.round(calculatedTotal * 100) / 100;

            // Step C2: Atomically Lock & Deduct Stock via InventoryService
            await InventoryService.deductStock(
                cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    productTitle: item.productTitle,
                })),
                client
            );

            finalTotal = Math.round(calculatedTotal * 100) / 100;

            // Step D: Insert Shipping Address & Create the Order
            const addressResult = await client.query(
                `INSERT INTO addresses (user_id, street, city, state, zip_code, country)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [
                    userId,
                    shippingAddress.street,
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.zipCode,
                    shippingAddress.country || 'India',
                ]
            );
            const addressId = addressResult.rows[0].id;

            const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const orderResult = await client.query(
                `INSERT INTO orders (order_number, user_id, shipping_address_id, total_amount, status)
                 VALUES ($1, $2, $3, $4, 'PENDING')
                 RETURNING id, order_number as "orderNumber", user_id as "userId", total_amount as "totalAmount", status, created_at as "createdAt"`,
                [orderNumber, userId, addressId, finalTotal]
            );
            const order = orderResult.rows[0];

            // Step E: Create immutable Order Items (Snapshotting price & title!)
            const orderItems: OrderItemResponse[] = [];
            for (const item of cartItems) {
                const unitPrice = parseFloat(item.price);
                const itemTotal = unitPrice * item.quantity;
                const orderItemResult = await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_title, unit_price, quantity)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, product_id as "productId", product_title as "productTitle", unit_price as "unitPrice", quantity`,
                    [order.id, item.productId, item.productTitle, unitPrice, item.quantity]
                );
                const createdItem = orderItemResult.rows[0];
                orderItems.push({
                    ...createdItem,
                    unitPrice: parseFloat(createdItem.unitPrice),
                    totalPrice: itemTotal,
                });
            }
            // Step F: Empty the user's cart!
            await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
            return {
                ...order,
                totalAmount: parseFloat(order.totalAmount),
                shippingAddress,
                items: orderItems,
            };
        });
    }
    // 2. GET USER'S ORDER HISTORY
    static async getUserOrders(userId: number): Promise<OrderResponse[]> {
        const ordersResult = await query(
            `SELECT 
               o.id, o.order_number as "orderNumber", o.user_id as "userId", o.total_amount as "totalAmount", o.status,
               json_build_object(
                 'street', a.street,
                 'city', a.city,
                 'state', a.state,
                 'zipCode', a.zip_code,
                 'country', a.country
               ) as "shippingAddress",
               o.created_at as "createdAt"
             FROM orders o
             JOIN addresses a ON o.shipping_address_id = a.id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC`,
            [userId]
        );
        const orders: OrderResponse[] = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await query(
                `SELECT id, product_id as "productId", product_title as "productTitle", unit_price as "unitPrice", quantity
         FROM order_items
         WHERE order_id = $1`,
                [order.id]
            );
            const items = itemsResult.rows.map((item) => ({
                ...item,
                unitPrice: parseFloat(item.unitPrice),
                totalPrice: parseFloat(item.unitPrice) * item.quantity,
            }));
            orders.push({
                ...order,
                totalAmount: parseFloat(order.totalAmount),
                items,
            });
        }
        return orders;
    }
    // 3. GET SINGLE ORDER BY ID
    static async getOrderById(userId: number, orderId: number): Promise<OrderResponse> {
        const orderResult = await query(
            `SELECT 
               o.id, o.order_number as "orderNumber", o.user_id as "userId", o.total_amount as "totalAmount", o.status,
               json_build_object(
                 'street', a.street,
                 'city', a.city,
                 'state', a.state,
                 'zipCode', a.zip_code,
                 'country', a.country
               ) as "shippingAddress",
               o.created_at as "createdAt"
             FROM orders o
             JOIN addresses a ON o.shipping_address_id = a.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );
        const order = orderResult.rows[0];
        if (!order) {
            throw ApiError.notFound('Order not found');
        }
        const itemsResult = await query(
            `SELECT id, product_id as "productId", product_title as "productTitle", unit_price as "unitPrice", quantity
       FROM order_items
       WHERE order_id = $1`,
            [order.id]
        );
        const items = itemsResult.rows.map((item) => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.unitPrice) * item.quantity,
        }));
        return {
            ...order,
            totalAmount: parseFloat(order.totalAmount),
            items,
        };
    }
}