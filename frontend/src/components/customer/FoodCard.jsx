import React, { useState } from 'react';
import { Plus, Minus, MessageSquare, Check } from 'lucide-react';
import { formatMoney } from '../../services/api.js';

export default function FoodCard({ food, quantity = 0, onUpdateQuantity }) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  const {
    name,
    description,
    price,
    image,
    dietary = [],
    isAvailable = true,
    isFeatured = false
  } = food;

  const handleAdd = () => {
    if (!isAvailable) return;
    onUpdateQuantity(food, 1);
  };

  const handleSaveNote = () => {
    onUpdateQuantity(food, quantity || 1, note);
    setShowNoteModal(false);
  };

  return (
    <div className="relative flex flex-col sm:flex-row justify-between gap-4 rounded-2xl border border-[#e7e9e6] bg-white p-4 shadow-xs hover:border-[#195c45]/30 transition">
      {/* Food Details */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Dietary / Featured Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {isFeatured && (
            <span className="rounded-full bg-[#fdf1ec] px-2 py-0.5 text-[10px] font-bold text-[#ef6b42]">
              Chef's Pick
            </span>
          )}
          {dietary.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-[#e6efe8] px-2 py-0.5 text-[10px] font-semibold text-[#195c45]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-serif text-base font-bold text-[#17211d] leading-snug">
          {name}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-[#66706b] line-clamp-2">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm font-bold text-[#17211d]">
            {formatMoney(price)}
          </span>

          {!isAvailable && (
            <span className="text-xs font-semibold text-[#66706b] italic">
              Sold out today
            </span>
          )}
        </div>
      </div>

      {/* Image & Action Stepper */}
      <div className="relative flex sm:flex-col items-center justify-between sm:justify-start gap-3 shrink-0">
        <div className="relative h-24 w-28 sm:h-24 sm:w-28 overflow-hidden rounded-xl bg-[#f7f6f1]">
          <img
            src={image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
            alt={name}
            loading="lazy"
            className={`h-full w-full object-cover transition ${!isAvailable ? 'grayscale opacity-60' : ''}`}
          />
        </div>

        {/* Quantity Controller */}
        {isAvailable && (
          <div>
            {quantity > 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-[#e6efe8] border border-[#195c45]/20 p-1 text-[#195c45] shadow-xs">
                <button
                  onClick={() => onUpdateQuantity(food, quantity - 1)}
                  className="grid h-6 w-6 place-items-center rounded-lg hover:bg-[#195c45] hover:text-white transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#17211d]">
                  {quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(food, quantity + 1)}
                  className="grid h-6 w-6 place-items-center rounded-lg hover:bg-[#195c45] hover:text-white transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 rounded-xl border border-[#195c45] bg-white px-3.5 py-1.5 text-xs font-bold text-[#195c45] hover:bg-[#195c45] hover:text-white transition shadow-2xs active:scale-95"
              >
                <span>Add</span>
                <Plus size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
