import React from 'react';
import { Heart, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';

export default function Footer({ onNavigate, onSelectCuisine }) {
  return (
    <footer className="border-t border-[#e7e9e6] bg-[#fbfaf7] pt-12 pb-10 text-[#66706b]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-[#17211d]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ef6b42] text-base font-bold text-white shadow-2xs">
                S
              </span>
              <span>savor</span>
            </div>
            <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-[#66706b]">
              Thoughtfully selected local kitchens, artisanal sourdough bakeries, and vibrant bowls — prepared with integrity and delivered beautifully.
            </p>
            <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-[#17211d]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#195c45]" />
                Freshly Sealed
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#ef6b42]" />
                Zero Waste Food Rescue
              </span>
            </div>
          </div>

          {/* Discover Cuisines */}
          <div>
            <h4 className="font-serif text-xs font-bold text-[#17211d] uppercase tracking-wider mb-3.5">
              Cuisines
            </h4>
            <ul className="space-y-2 text-xs">
              {['Italian & Pizza', 'Healthy & Bowls', 'Artisanal Burgers', 'Japanese & Sushi', 'French Bakery', 'Indian Curry'].map((c) => (
                <li key={c}>
                  <button
                    onClick={() => {
                      onSelectCuisine?.(c.split(' ')[0]);
                      onNavigate?.('home');
                    }}
                    className="hover:text-[#195c45] transition"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences & Features */}
          <div>
            <h4 className="font-serif text-xs font-bold text-[#17211d] uppercase tracking-wider mb-3.5">
              Experiences
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate?.('rescue')} className="hover:text-[#ef6b42] transition">
                  Food Rescue Surplus
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('group')} className="hover:text-[#195c45] transition">
                  Smart Group Ordering
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('home')} className="hover:text-[#195c45] transition">
                  Local Favorites
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('profile')} className="hover:text-[#195c45] transition">
                  Manage Addresses
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Demo Switcher */}
          <div>
            <h4 className="font-serif text-xs font-bold text-[#17211d] uppercase tracking-wider mb-3.5">
              Platform Demo
            </h4>
            <p className="text-xs text-[#66706b] mb-2.5">
              Multi-role access for customer, restaurant and admin workflows:
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="rounded-lg bg-white border border-[#e7e9e6] p-2">
                <span className="font-bold text-[#17211d]">Customer:</span> alex@savor.local
              </div>
              <div className="rounded-lg bg-white border border-[#e7e9e6] p-2">
                <span className="font-bold text-[#17211d]">Kitchen:</span> owner@savor.local
              </div>
              <div className="rounded-lg bg-white border border-[#e7e9e6] p-2">
                <span className="font-bold text-[#17211d]">Admin:</span> admin@savor.local
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#e7e9e6] pt-5 text-xs text-[#66706b] gap-3">
          <p>© {new Date().getFullYear()} Savor Culinary Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart size={13} className="text-[#ef6b42] fill-[#ef6b42] inline" /> for fine food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
