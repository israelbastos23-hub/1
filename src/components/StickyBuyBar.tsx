import React from 'react';

interface StickyBuyBarProps {
  isVisible: boolean;
  productImage: string;
  vehicleLabel: string;
  setTitle: string;
  price: number;
  originalPrice: number;
  onBuyClick: () => void;
}

export const StickyBuyBar: React.FC<StickyBuyBarProps> = ({
  isVisible,
  productImage,
  vehicleLabel,
  setTitle,
  price,
  originalPrice,
  onBuyClick,
}) => {
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick purchase bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF]/98 backdrop-blur-md border-t border-[#F1F1F1] shadow-[0_-2px_12px_rgba(0,0,0,0.05)] py-1.5 sm:py-2 px-3 sm:px-6 transition-transform duration-300 transform translate-y-0"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Product Thumbnail & Selected Configuration */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-[#F7F7F7] border border-[#F1F1F1] flex-shrink-0 shadow-xs">
            <img
              src={productImage}
              alt="3D Car Mats Thumbnail"
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = '/images/foto-01.jpg';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-[13px] font-bold text-neutral-900 truncate flex items-center gap-1.5">
              <span>3D Car Mats</span>
              <span className="hidden sm:inline-block text-[11px] font-normal text-neutral-500">
                • {setTitle}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
              {vehicleLabel}
            </div>
          </div>
        </div>

        {/* Right: Price & Buy Button */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
              £{price.toFixed(2)}
            </div>
            <div className="text-[9px] sm:text-[11px] text-neutral-400 line-through">
              £{originalPrice.toFixed(2)}
            </div>
          </div>

          <button
            type="button"
            onClick={onBuyClick}
            className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <span>ADD TO BASKET</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
