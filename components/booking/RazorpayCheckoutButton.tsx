'use client';

import { useState } from 'react';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

interface RazorpayCheckoutButtonProps {
  amount: number; // rupees — the user's own chosen top-up amount
  onSuccess: () => void;
  label?: string;
}

// Razorpay only funds the wallet, never a specific booking directly — see
// app/api/wallet/orders and app/api/wallet/verify. Payment itself happens
// entirely inside Razorpay's own hosted widget; this component never
// touches card/UPI details, only the order id/key needed to open it and the
// resulting signature that gets verified server-side afterwards.
export default function RazorpayCheckoutButton({ amount, onSuccess, label = 'Add money' }: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setError(null);
    setLoading(true);
    try {
      const orderRes = await fetch('/api/wallet/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        setError(order.error || 'Could not start payment');
        setLoading(false);
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay unavailable');

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'Phool Gobhi',
        description: 'Wallet top-up',
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/wallet/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const data = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(data.error || 'Payment verification failed');
              return;
            }
            onSuccess();
          } catch {
            setError('Network error verifying payment');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch {
      setError('Could not start payment');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
      >
        {loading ? 'Opening…' : label}
      </button>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
