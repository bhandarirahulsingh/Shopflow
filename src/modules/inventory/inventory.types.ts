
// 1. What a service sends when it wants to deduct stock
export interface DeductStockItem {
    productId: number;
    quantity: number;
    productTitle?: string; // Optional: helps print nice error messages like "Insufficient stock for iPhone 15"
}

// 2. What the inventory returns when you ask "How much stock do we have?"
export interface InventoryStockStatus {
    id: number;
    productId: number;
    quantity: number;          // Total physical units in warehouse
    reservedQuantity: number;  // Units temporarily held in active carts/orders
    availableStock: number;    // quantity - reservedQuantity (what can actually be sold right now)
}
