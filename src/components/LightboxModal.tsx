import React from 'react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative max-w-4xl w-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 z-10 flex flex-col">
        <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between text-white">
          <span className="text-xs font-semibold tracking-wide text-neutral-300">{title}</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition"
            aria-label="Close image zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-square sm:aspect-4/3 w-full bg-neutral-950 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain select-none"
          />
        </div>

        <div className="px-5 py-3 bg-neutral-950/80 border-t border-neutral-800 text-center text-[11px] text-neutral-400">
          Laser-measured 3D precision edge & water-resistant thermo-formed texture
        </div>
      </div>
    </div>
  );
};
