import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { message, type = 'info' } = notification;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-down">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xs ${
          isError
            ? 'border-red-200 bg-red-50/95 text-red-900'
            : isSuccess
            ? 'border-[#195c45]/20 bg-[#e6efe8]/95 text-[#195c45]'
            : 'border-[#e7e9e6] bg-white/95 text-[#17211d]'
        }`}
      >
        {isSuccess && <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#195c45]" />}
        {isError && <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />}
        {!isSuccess && !isError && <Info className="h-4.5 w-4.5 shrink-0 text-[#ef6b42]" />}

        <p className="text-xs sm:text-sm font-medium leading-snug">{message}</p>

        <button
          onClick={onClose}
          className="ml-auto -mr-1 p-1 text-[#66706b] hover:text-[#17211d] transition"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
