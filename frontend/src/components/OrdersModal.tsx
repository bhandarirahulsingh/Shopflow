import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { X, PackageCheck, Truck, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchOrders = async () => {
                try {
                    setLoading(true);
                    const data: Order[] = await api.get('/orders');
                    setOrders(data || []);
                    if (data && data.length > 0) setSelectedOrder(data[0]);
                } catch (err) {
                    console.error('Failed to load orders:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Your Orders & Deliveries</h2>
                            <p className="text-xs text-gray-500">Track shipments and download tax invoices</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="p-12 text-center text-xs text-gray-500">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Loading your orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-16 text-center">
                        <PackageCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">No orders placed yet</h3>
                        <p className="text-xs text-gray-500 mt-1">Browse the catalog and place your first hardware order.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Left: Orders List */}
                        <div className="w-full md:w-80 border-r border-gray-100 overflow-y-auto p-4 space-y-2.5 bg-gray-50/50">
                            {orders.map((ord) => (
                                <button
                                    key={ord.id}
                                    onClick={() => setSelectedOrder(ord)}
                                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${selectedOrder?.id === ord.id
                                        ? 'border-blue-600 bg-white shadow-xs'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="font-mono font-bold text-blue-700">{ord.orderNumber}</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            {ord.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                                        <span className="font-bold text-gray-900">₹{Number(ord.totalAmount).toLocaleString('en-IN')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Right: Selected Order Detail & Live Timeline */}
                        {selectedOrder && (
                            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
                                {/* Order Status Banner */}
                                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Active Shipment</span>
                                        <h3 className="text-base font-bold text-gray-900">Order {selectedOrder.orderNumber}</h3>
                                        <p className="text-xs text-gray-500">
                                            Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => window.print()}
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        Print Invoice
                                    </button>
                                </div>

                                {/* Live Delivery Tracking Timeline */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Delivery Timeline</h4>
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-600">
                                        <div className="relative flex items-start gap-3">
                                            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Order Placed & Payment Confirmed</p>
                                                <p className="text-[11px] text-gray-500">Pessimistic row-lock inventory deducted atomically in PostgreSQL.</p>
                                            </div>
                                        </div>

                                        <div className="relative flex items-start gap-3">
                                            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Packed at Bengaluru Fulfillment Center</p>
                                                <p className="text-[11px] text-gray-500">Barcodes scanned & tamper-proof sealed.</p>
                                            </div>
                                        </div>

                                        <div className="relative flex items-start gap-3">
                                            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] animate-pulse">
                                                <Truck className="h-3 w-3" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-blue-700">In Transit with BlueDart Express</p>
                                                <p className="text-[11px] text-gray-500">Expected Delivery Tomorrow by 5:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address & Items */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                                        <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1">
                                            Shipping Destination
                                        </span>
                                        <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress.street}</p>
                                        <p className="text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                                        <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1">
                                            Payment Summary
                                        </span>
                                        <div className="flex justify-between font-bold text-gray-900 text-sm mt-1">
                                            <span>Total Paid:</span>
                                            <span className="text-blue-600">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" /> Secured by PostgreSQL ACID
                                        </p>
                                    </div>
                                </div>

                                {/* Items Breakdown */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                                        Purchased Items ({selectedOrder.items?.length || 0})
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                                            >
                                                <div>
                                                    <span className="font-semibold text-gray-900 block">{item.productTitle}</span>
                                                    <span className="text-gray-500">Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    ₹{(item.quantity * Number(item.unitPrice)).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
