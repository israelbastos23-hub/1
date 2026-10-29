import React, { useState } from 'react';
import { POPULAR_MAKES } from '../data/vehicles';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (make: string, model: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectVehicle }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredVehicles: { make: string; model: string }[] = [];
  const q = query.trim().toLowerCase();

  if (q.length > 0) {
    POPULAR_MAKES.forEach((makeItem) => {
      makeItem.models.forEach((model) => {
        if (
          model.toLowerCase().includes(q) ||
          makeItem.make.toLowerCase().includes(q) ||
          `${makeItem.make} ${model}`.toLowerCase().includes(q)
        ) {
          filteredVehicles.push({ make: makeItem.make, model });
        }
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-start justify-center pt-20 p-4 text-center">
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all max-w-lg w-full border border-neutral-200">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by car make or model (e.g. BYD, Tesla, Golf, BMW)..."
              className="flex-1 text-sm outline-hidden border-none focus:ring-0 p-0 text-neutral-900 placeholder:text-neutral-400"
            />
            <button onClick={onClose} className="text-neutral-400 hover:text-black p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto text-xs space-y-2">
            {query.trim().length === 0 ? (
              <div className="space-y-3 py-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Popular Car Makes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_MAKES.slice(0, 8).map((m) => (
                    <button
                      key={m.make}
                      onClick={() => {
                        onSelectVehicle(m.make, m.models[0]);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition"
                    >
                      {m.make}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-1">
                  Matching Custom Fits ({filteredVehicles.length}):
                </div>
                {filteredVehicles.slice(0, 10).map((v, i) => (
                  <button
                    key={`${v.make}-${v.model}-${i}`}
                    onClick={() => {
                      onSelectVehicle(v.make, v.model);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-neutral-800 transition"
                  >
                    <div>
                      <span className="font-bold text-neutral-900">{v.make}</span> • {v.model}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">Custom Fit Available →</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500">
                <p>No exact vehicle match for "{query}".</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  You can also select "Other make" or "Other model" in the vehicle selector above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
