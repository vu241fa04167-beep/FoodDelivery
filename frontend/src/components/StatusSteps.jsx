import React from 'react';

// Steps ordered sequentially
const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

export default function StatusSteps({ currentStatus }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-semibold text-center">
        ✕ This order was cancelled
      </div>
    );
  }

  // Find index of current status
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
        
        {/* Active progress fill */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%` }}
        />

        {/* Step Circles and Labels */}
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-orange-100'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'text-primary' : isDone ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

