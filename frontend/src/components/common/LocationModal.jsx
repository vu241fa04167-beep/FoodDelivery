import React, { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'West Village, NY', zip: '10014', tag: 'Current' },
  { name: 'SoHo, NY', zip: '10012' },
  { name: 'East Village, NY', zip: '10003' },
  { name: 'NoHo, NY', zip: '10012' },
  { name: 'Upper West Side, NY', zip: '10023' },
  { name: 'Flatiron District, NY', zip: '10010' },
  { name: 'Brooklyn Heights, NY', zip: '11201' }
];

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectLocation(customInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e7e9e6]">
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e9e6]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf1ec] text-[#ef6b42]">
              <MapPin size={17} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17211d]">Delivery Location</h3>
              <p className="text-xs text-[#66706b]">Discover kitchens delivering to you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#f7f6f1] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCustomSubmit} className="mt-5">
          <label className="text-xs font-bold text-[#17211d] block mb-1.5 uppercase tracking-wider">
            Enter Street Address or Zip
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 220 W 14th St, New York"
              className="flex-1 rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] px-3.5 py-2.5 text-sm outline-none focus:border-[#195c45] focus:bg-white transition"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#195c45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124534] transition shadow-2xs"
            >
              Set
            </button>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-xs font-bold text-[#66706b] uppercase tracking-wider mb-2">Popular Neighborhoods</p>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected = currentLocation?.toLowerCase().includes(loc.name.split(',')[0].toLowerCase());
              return (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation(loc.name);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm transition ${
                    isSelected
                      ? 'bg-[#e6efe8] font-semibold text-[#195c45]'
                      : 'hover:bg-[#f7f6f1] text-[#17211d]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin size={15} className={isSelected ? 'text-[#195c45]' : 'text-[#66706b]'} />
                    {loc.name}
                  </span>
                  {isSelected && <Check size={16} className="text-[#195c45]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
