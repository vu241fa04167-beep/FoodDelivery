import React, { useState } from 'react';

// Reusable address form used in Profile and Checkout pages
export default function AddressForm({
  initialData = {}, onSubmit, onCancel, submitLabel = 'Save address',
  showSaveCheckbox = false, saveAddress = true, onSaveAddressChange,
  loading = false, formId, hideSubmit = false
}) {
  const [formData, setFormData] = useState({
    label: initialData.label || 'Home',
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    line1: initialData.line1 || '',
    area: initialData.area || '',
    pincode: initialData.pincode || ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(formData.phone.trim())) errs.phone = '10 digits required';
    if (!formData.line1.trim()) errs.line1 = 'Address line is required';
    if (!formData.area.trim()) errs.area = 'Area is required';
    if (!/^\d{6}$/.test(formData.pincode.trim())) errs.pincode = '6 digits required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Address Label</label>
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setFormData({ ...formData, label: lbl })}
              className={`px-3 py-1 rounded border text-xs font-semibold ${
                formData.label === lbl ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-2.5 py-1.5 border rounded border-gray-300 focus:outline-none focus:border-primary"
          />
          {errors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Phone Number (10 digits) *</label>
          <input
            type="tel"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="10-digit mobile"
            className="w-full px-2.5 py-1.5 border rounded border-gray-300 focus:outline-none focus:border-primary"
          />
          {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Address Line *</label>
        <input
          type="text"
          value={formData.line1}
          onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
          placeholder="Flat / House no, Building name, Street"
          className="w-full px-2.5 py-1.5 border rounded border-gray-300 focus:outline-none focus:border-primary"
        />
        {errors.line1 && <p className="text-red-500 text-[11px] mt-0.5">{errors.line1}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Area / Locality *</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            placeholder="e.g. Koramangala"
            className="w-full px-2.5 py-1.5 border rounded border-gray-300 focus:outline-none focus:border-primary"
          />
          {errors.area && <p className="text-red-500 text-[11px] mt-0.5">{errors.area}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Pincode (6 digits) *</label>
          <input
            type="text"
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
            placeholder="6-digit pincode"
            className="w-full px-2.5 py-1.5 border rounded border-gray-300 focus:outline-none focus:border-primary"
          />
          {errors.pincode && <p className="text-red-500 text-[11px] mt-0.5">{errors.pincode}</p>}
        </div>
      </div>

      {showSaveCheckbox && (
        <label className="flex items-center gap-2 pt-1 font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => onSaveAddressChange && onSaveAddressChange(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary rounded"
          />
          <span>Save this address for future orders</span>
        </label>
      )}

      {!hideSubmit && (
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white font-bold rounded hover:opacity-90 disabled:opacity-50">
            {loading ? 'Saving...' : submitLabel}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200">
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
}
