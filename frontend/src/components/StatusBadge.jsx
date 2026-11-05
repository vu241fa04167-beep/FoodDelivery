import React from 'react';

const BADGE_STYLES = {
  placed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-amber-100 text-amber-800 border-amber-200',
  out_for_delivery: 'bg-orange-100 text-primary border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const LABELS = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected'
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase() || '';
  const style = BADGE_STYLES[key] || 'bg-gray-100 text-gray-700 border-gray-200';
  const label = LABELS[key] || status?.replace('_', ' ') || '';

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${style}`}>
      {label}
    </span>
  );
}

