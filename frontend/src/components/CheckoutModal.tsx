import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { X, CheckCircle, CreditCard, QrCode, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import type { Order } from '../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const { cart, totalAmount, clearCart } = useCart();
    const [step, setStep] = useState<'ADDRESS' | 'PAYMENT' | 'SUCCESS'>('ADDRESS');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Address State
    const [street, setStreet] = useState('123 Indiranagar 100ft Road');
    const [city, setCity] = useState('Bengaluru');
    const [state, setState] = useState('Karnataka');
    const [zipCode, setZipCode] = useState('560038');

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'WALLET' | 'COD'>('UPI');
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

    if (!isOpen) return null;

    // 1. Submit Checkout: Calls backend to place Order with pessimistic row locking!
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const order: Order = await api.post('/orders/checkout', {
                shippingAddress: { street, city, state, zipCode, country: 'India' },
            });
            setCreatedOrder(order);
            setStep('PAYMENT');
        } catch (err: any) {
            setError(err.message || 'Checkout failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. Submit Payment: Calls backend to simulate payment gateway and confirm order!
    const handlePayNow = async () => {
        if (!createdOrder) return;
        setError(null);
        setIsSubmitting(true);

        try {
            await api.post('/payments/process', {
                orderId: createdOrder.id,
                paymentMethod,
                amount: createdOrder.totalAmount,
            });
            await clearCart();
            setStep('SUCCESS');
        } catch (err: any) {
            setError(err.message || 'Payment processing failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* STEP 1: Shipping Address Form */}
                {step === 'ADDRESS' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Shipping Details</h2>
                            <p className="text-xs text-gray-500 mt-1">Where should we deliver your order?</p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handlePlaceOrder} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">PIN Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Summary Pill */}
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center text-xs mt-4">
                                <span className="text-gray-600">Total Order Amount ({cart?.totalItems} items):</span>
                                <span className="text-base font-bold text-blue-600">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Review & Proceed to Pay'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2: Simulated Payment Gateway */}
                {step === 'PAYMENT' && createdOrder && (
                    <div>
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
                                <span className="text-xs text-blue-700 font-mono font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                    {createdOrder.orderNumber}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Select your preferred payment method</p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Payment Method Selector Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                                { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
                                { id: 'WALLET', label: 'ShopFlow Wallet', icon: Wallet },
                                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                            ].map((m) => {
                                const Icon = m.icon;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all ${paymentMethod === m.id
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className={`h-4 w-4 ${paymentMethod === m.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <span className="text-xs font-semibold">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Simulated UPI QR Preview if UPI selected */}
                        {paymentMethod === 'UPI' && (
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center mb-6">
                                <div className="h-24 w-24 mx-auto rounded-xl bg-white p-2 flex items-center justify-center mb-2 shadow-2xs border border-gray-100">
                                    <QrCode className="h-20 w-20 text-gray-800" />
                                </div>
                                <p className="text-[11px] text-gray-500">Scan QR with Google Pay, PhonePe, or Paytm</p>
                            </div>
                        )}

                        <button
                            onClick={handlePayNow}
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                `Pay ₹${Number(createdOrder.totalAmount).toLocaleString('en-IN')}`
                            )}
                        </button>
                    </div>
                )}

                {/* STEP 3: Order Placed & Confirmed Receipt */}
                {step === 'SUCCESS' && (
                    <div className="text-center py-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h2>
                        <p className="text-xs text-gray-500 mt-1">Your order has been recorded and confirmed in PostgreSQL.</p>

                        <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order Number:</span>
                                <span className="font-mono font-bold text-gray-900">{createdOrder?.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Paid:</span>
                                <span className="font-bold text-emerald-700">₹{Number(createdOrder?.totalAmount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                    <ShieldCheck className="h-3.5 w-3.5" /> CONFIRMED
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
