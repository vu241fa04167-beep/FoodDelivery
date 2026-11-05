import React from 'react';

export function RestaurantCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-3 border border-[#e7e9e6] shadow-2xs animate-pulse">
      <div className="h-44 w-full rounded-xl bg-stone-200" />
      <div className="mt-3.5 space-y-2">
        <div className="h-4.5 w-3/4 rounded bg-stone-200" />
        <div className="h-3 w-1/2 rounded bg-stone-100" />
        <div className="flex items-center gap-2 pt-1.5">
          <div className="h-4 w-12 rounded bg-stone-200" />
          <div className="h-4 w-16 rounded bg-stone-100" />
          <div className="h-4 w-16 rounded bg-stone-100" />
        </div>
      </div>
    </div>
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#e7e9e6] bg-white p-4 shadow-2xs animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4.5 w-1/2 rounded bg-stone-200" />
        <div className="h-3 w-5/6 rounded bg-stone-100" />
        <div className="h-4 w-16 rounded bg-stone-200 pt-1" />
      </div>
      <div className="h-20 w-24 shrink-0 rounded-xl bg-stone-200" />
    </div>
  );
}
