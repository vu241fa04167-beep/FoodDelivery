import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'Nothing here yet',
  description = 'Explore delicious menus from our curated local restaurants.',
  actionText,
  onAction
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f7f6f1] border border-[#e7e9e6] text-[#195c45] shadow-2xs">
        <Icon className="h-7 w-7 text-[#195c45]" />
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#17211d]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#66706b]">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#195c45] px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#124534] transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
