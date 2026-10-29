import React, { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  const [shippingMethod, setShippingMethod] = useState<'free' | 'express'>('free');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'klarna'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === 'express' ? 4.99 : 0;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate fast reliable payment gateway processing
    setTimeout(() => {
      setIsSubmitting(false);
      const randomOrder = 'KAV-' + Math.floor(100000 + Math.random() * 900000);
      setOrderConfirmed(randomOrder);
      onOrderSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full border border-neutral-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-neutral-900 text-sm">KAVERE CAR CHECKOUT</span>
              <span className="text-neutral-300">|</span>
              <span className="text-xs text-neutral-500 font-medium">UK Fast Delivery</span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-black p-1 rounded-md transition"
              aria-label="Close checkout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {orderConfirmed ? (
            /* Order Success View */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-neutral-900">Order Confirmed!</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Thank you for your purchase. We have received your order and are custom-tailoring your mats.
                </p>
                <div className="mt-3 inline-block bg-neutral-100 text-neutral-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-neutral-200">
                  Order Number: #{orderConfirmed}
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 text-left border border-neutral-200/80 text-xs space-y-2">
                <div className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                  Custom Mat Specification:
                </div>
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-neutral-700">
                    <span>
                      {it.quantity}x {it.vehicle.make} {it.vehicle.model} ({it.vehicle.year}) — {it.setTitle}
                    </span>
                    <span className="font-semibold">£{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900 text-sm">
                  <span>Total Paid:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-3 text-xs text-blue-900 text-left flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">ℹ</span>
                <div>
                  <span className="font-semibold">Estimated Delivery:</span> 2-3 business days via Royal Mail 48 Tracked.
                  A tracking number will be sent to <strong>{email || 'your email'}</strong> once dispatched from our UK fulfillment center.
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition"
              >
                Back to Store
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
              {/* Order Summary Snapshot */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-neutral-900 text-xs">
                  <span>Selected Vehicle Mat Sets ({items.length})</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-neutral-600 text-[11px]">
                    <span className="truncate max-w-[320px]">
                      {item.quantity}x {item.vehicle.make} {item.vehicle.model} ({item.vehicle.year}) — {item.setTitle}
                    </span>
                    <span className="font-semibold text-neutral-800">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="text-[10px] text-emerald-700 font-semibold">
                  ✓ Free Wiper Blades Kit included with each set
                </div>
              </div>

              {/* 1. Contact & Shipping Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  1. Contact & UK Delivery Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Email for tracking</label>
                    <input
                      type="email"
                      required
                      placeholder="alex.smith@example.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Phone number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+44 7123 456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="14 High Street, Apt 3B"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Town / City</label>
                    <input
                      type="text"
                      required
                      placeholder="London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">UK Postcode</label>
                    <input
                      type="text"
                      required
                      placeholder="SW1A 1AA"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      className="w-full uppercase rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  2. Delivery Speed
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      shippingMethod === 'free'
                        ? 'border-black bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'free'}
                        onChange={() => setShippingMethod('free')}
                        className="text-black focus:ring-black"
                      />
                      <div>
                        <div className="font-bold text-neutral-900">Royal Mail 48 Tracked</div>
                        <div className="text-[11px] text-neutral-500">2 - 3 Business Days</div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700 uppercase text-[11px]">FREE</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      shippingMethod === 'express'
                        ? 'border-black bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="text-black focus:ring-black"
                      />
                      <div>
                        <div className="font-bold text-neutral-900">DPD Express Next Day</div>
                        <div className="text-[11px] text-neutral-500">Next Business Day</div>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">£4.99</span>
                  </label>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  3. Payment Method
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'applepay'
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    Apple / Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('klarna')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'klarna'
                        ? 'border-black bg-pink-100 text-pink-900'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    Klarna (Pay in 3)
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Card number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4532 •••• •••• 8821"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Expiry date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full rounded-lg border-neutral-200 py-2 px-2.5 text-xs bg-neutral-50/50 focus:border-black focus:ring-black"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'applepay' && (
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center space-y-2">
                    <p className="text-xs text-neutral-600">
                      Use biometric 1-touch payment with your saved Apple Wallet or Google Pay card.
                    </p>
                    <div className="text-[11px] text-neutral-400">Total charge: £{total.toFixed(2)}</div>
                  </div>
                )}

                {paymentMethod === 'klarna' && (
                  <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-200 text-xs text-neutral-700 space-y-1">
                    <div className="font-bold text-neutral-900">3 interest-free payments of £{(total / 3).toFixed(2)}</div>
                    <p className="text-[11px] text-neutral-500">
                      Pay 1/3 today, and the rest automatically every 30 days. No interest, no fees when you pay on time.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <span>CONFIRM & PLACE ORDER (£{total.toFixed(2)})</span>
                  )}
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-2">
                  By clicking Place Order, you confirm your custom vehicle fit and accept Kavere Car's Terms of Service.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
