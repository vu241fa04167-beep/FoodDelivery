import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';
import api from '../api/axios.js';
import AddressForm from '../components/AddressForm.jsx';

export default function Checkout() {
  const { restaurant, items, itemTotal, clearCart } = useCart();
  const navigate = useNavigate(), location = useLocation();
  const coupon = location.state?.coupon || null;

  const [addresses, setAddresses] = useState([]), [selectedId, setSelectedId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(true), [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/addresses').then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
      setAddresses(list);
      if (list.length) setSelectedId(list.find((a) => a.isDefault)?._id || list[0]._id);
    }).catch(() => {});
  }, []);

  if (!items || items.length === 0) return <Navigate to="/cart" replace />;

  const deliveryFee = itemTotal >= 500 ? 0 : 30, discount = coupon ? coupon.discount : 0;
  const tax = Math.round(itemTotal * 0.05), grandTotal = Math.max(0, itemTotal + deliveryFee + tax - discount);

  const placeOrder = async (fullAddress) => {
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        restaurantId: restaurant.id,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        address: fullAddress, paymentMethod, couponCode: coupon?.code
      });
      clearCart();
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSavedOrder = (e) => {
    e.preventDefault();
    const a = addresses.find((addr) => addr._id === selectedId);
    if (!a) return alert('Please select a delivery address');
    placeOrder(`${a.fullName}, Phone: ${a.phone}, ${a.line1}, ${a.area}, Bengaluru - ${a.pincode}`);
  };
  const handleNewOrder = async (data) => {
    if (saveAddress) try { await api.post('/auth/addresses', data); } catch (_) {}
    placeOrder(`${data.fullName}, Phone: ${data.phone}, ${data.line1}, ${data.area}, Bengaluru - ${data.pincode}`);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Checkout</h1>
      <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 flex items-center gap-3 text-sm text-orange-900">
        <span className="text-xs font-black uppercase tracking-wide bg-white rounded px-2 py-1">ETA</span><span><b>Estimated delivery:</b> {restaurant?.deliveryTime || '30–40 mins'} after placing your order.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white/95 border border-orange-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">1. Delivery Address</h3>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label key={a._id} className={`flex items-start gap-2 p-3 border rounded cursor-pointer text-xs ${selectedId === a._id ? 'border-primary bg-orange-50/20' : 'border-gray-200'}`}>
                    <input type="radio" name="address" checked={selectedId === a._id} onChange={() => setSelectedId(a._id)} className="mt-0.5 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{a.fullName}</span>
                        <span className="px-1.5 bg-gray-100 rounded text-[10px] uppercase font-bold">{a.label}</span>
                        {a.isDefault && <span className="px-1.5 bg-primary text-white rounded text-[10px] font-bold">Default</span>}
                      </div>
                      <p className="text-gray-600 mt-0.5">{a.line1}, {a.area} - {a.pincode} | Ph: {a.phone}</p>
                    </div>
                  </label>
                ))}
                <label className={`flex items-start gap-2 p-3 border rounded cursor-pointer text-xs ${selectedId === 'new' ? 'border-primary bg-orange-50/20' : 'border-gray-200'}`}>
                  <input type="radio" name="address" checked={selectedId === 'new'} onChange={() => setSelectedId('new')} className="mt-0.5 accent-primary" />
                  <span className="font-bold text-gray-800">Deliver to a new address</span>
                </label>
                {selectedId === 'new' && (
                  <div className="pt-2 border-t mt-2">
                    <AddressForm formId="checkout-form" hideSubmit showSaveCheckbox saveAddress={saveAddress} onSaveAddressChange={setSaveAddress} onSubmit={handleNewOrder} loading={loading} />
                  </div>
                )}
              </div>
            ) : (
              <AddressForm formId="checkout-form" hideSubmit showSaveCheckbox saveAddress={saveAddress} onSaveAddressChange={setSaveAddress} onSubmit={handleNewOrder} loading={loading} />
            )}
          </div>

          <div className="bg-white/95 border border-orange-100 rounded-2xl p-4 space-y-3 text-xs shadow-sm">
            <h3 className="font-bold text-gray-800 uppercase tracking-wide">2. Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-primary" />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-primary" />
                <span>Online payment (demo)</span>
              </label>
            </div>
            {paymentMethod === 'online' && (
              <div className="bg-orange-50/60 border border-orange-200 p-2.5 rounded text-xs">
                <p className="text-[11px] font-semibold text-primary">Demo Card: 4242 •••• •••• 4242 (MM/YY: 12/28, CVV: 123) - no real money deducted</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/95 border border-orange-100 rounded-2xl p-4 h-fit space-y-3 text-xs shadow-sm">
          <h3 className="font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Order Summary</h3>
          <p className="font-semibold text-gray-600">{restaurant?.name}</p>
          <div className="max-h-36 overflow-y-auto divide-y divide-gray-100">
            {items.map((it) => (
              <div key={it.menuItemId} className="py-1 flex justify-between">
                <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1 text-gray-600">
            <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(itemTotal)}</span></p>
            <p className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span></p>
            <p className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></p>
            {discount > 0 && <p className="flex justify-between text-green-700 font-bold"><span>Discount</span><span>-{formatPrice(discount)}</span></p>}
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-sm text-gray-900">
            <span>Grand Total</span><span className="text-primary">{formatPrice(grandTotal)}</span>
          </div>
          <button
            type={selectedId === 'new' || !addresses.length ? 'submit' : 'button'}
            form={selectedId === 'new' || !addresses.length ? 'checkout-form' : undefined}
            onClick={selectedId !== 'new' && addresses.length ? handleSavedOrder : undefined}
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:opacity-90 disabled:opacity-50"
          >{loading ? 'Placing order...' : 'Place order'}</button>
        </div>
      </div>
    </main>
  );
}
