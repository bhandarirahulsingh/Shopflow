import { PoolClient } from 'pg';
import { query } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { DeductStockItem, InventoryStockStatus } from './inventory.types';
import { redis, deleteKeysByPattern } from '../../config/redis';

export class InventoryService {
    // 1. Initialize Stock when a Product is Created
    static async createInitialStock(
        productId: number,
        quantity: number,
        client?: PoolClient
    ): Promise<void> {
        const sql = `
            INSERT INTO inventory (product_id, quantity, reserved_quantity)
            VALUES ($1, $2, 0)
        `;
        if (client) {
            await client.query(sql, [productId, quantity]);
        } else {
            await query(sql, [productId, quantity]);
        }
    }

    // 2. Query Current Stock for a Single Product
    static async getStock(
        productId: number,
        client?: PoolClient
    ): Promise<InventoryStockStatus> {
        const sql = `
            SELECT id, product_id as "productId", quantity, reserved_quantity as "reservedQuantity",
                   (quantity - reserved_quantity) as "availableStock"
            FROM inventory
            WHERE product_id = $1
        `;
        const result = client ? await client.query(sql, [productId]) : await query(sql, [productId]);

        if (result.rows.length === 0) {
            throw ApiError.notFound(`Inventory record not found for product ID ${productId}`);
        }
        return result.rows[0];
    }

    // 3. Atomically Lock & Deduct Stock for Multiple Items (Used by Checkout)
    static async deductStock(
        items: DeductStockItem[],
        client: PoolClient
    ): Promise<void> {
        for (const item of items) {
            // A. PESSIMISTIC ROW LOCK: Lock this specific inventory row until the transaction completes!
            const lockResult = await client.query(
                `SELECT id, quantity, reserved_quantity
                 FROM inventory
                 WHERE product_id = $1
                 FOR UPDATE`,
                [item.productId]
            );

            if (lockResult.rows.length === 0) {
                throw ApiError.badRequest(
                    `Inventory record missing for '${item.productTitle || `Product #${item.productId}`}'`
                );
            }

            const inv = lockResult.rows[0];
            const availableStock = inv.quantity - inv.reserved_quantity;

            // B. Business Invariant Check
            if (availableStock < item.quantity) {
                throw ApiError.badRequest(
                    `Insufficient stock for '${item.productTitle || `Product #${item.productId}`}'. Only ${availableStock} units available.`
                );
            }

            // C. Deduct Stock Permanently
            await client.query(
                `UPDATE inventory
                 SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
                 WHERE product_id = $2`,
                [item.quantity, item.productId]
            );
            try {
                await redis.del(`product:${item.productId}`);
                await deleteKeysByPattern('products:list:*');
            } catch (err: any) {
                console.warn('⚠️ [Redis] Cache invalidation warning:', err.message);
            }

        }
    }

    // 4. Release / Return Stock (Used if an Order is Cancelled / Refunded)
    static async releaseStock(
        items: DeductStockItem[],
        client: PoolClient
    ): Promise<void> {
        for (const item of items) {
            await client.query(
                `UPDATE inventory
                 SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
                 WHERE product_id = $2`,
                [item.quantity, item.productId]
            );
        }
    }
}
