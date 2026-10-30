import React, { useState, useEffect } from 'react';
import { updateConsentState } from '../utils/tracking';

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kavere_cookie_consent');
      if (!saved) {
        // Show banner after brief delay so it doesn't jarringly block initial render
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, []);

  const handleAcceptAll = () => {
    updateConsentState({ analytics: true, marketing: true });
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleRejectNonEssential = () => {
    updateConsentState({ analytics: false, marketing: false });
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    updateConsentState({ analytics: analyticsEnabled, marketing: marketingEnabled });
    setIsOpen(false);
    setShowPreferences(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-2xl text-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <h4 className="font-bold text-neutral-900 tracking-tight">Your Cookie Choices in the UK</h4>
          </div>
          <p className="text-neutral-600 leading-relaxed text-xs">
            We use essential cookies to make KAVERECAR.COM work. With your permission, we also use analytical and marketing cookies (including Google Analytics 4, Microsoft Clarity, and Meta) to understand visitor behavior and improve your shopping experience. You can choose to accept all or customize your preferences below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition cursor-pointer"
          >
            Customise
          </button>
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition cursor-pointer"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-lg shadow-sm transition cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-100 text-left">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-base">Cookie Preferences</h3>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-neutral-400 hover:text-black text-lg font-bold p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              {/* Essential */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900">Strictly Necessary</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-[11px] text-neutral-500">Required for the website to function, maintain security, and process vehicle selections.</p>
              </div>

              {/* Analytics */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900">Analytics &amp; Performance</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                <p className="text-[11px] text-neutral-500">Google Analytics 4 &amp; Microsoft Clarity to understand heatmaps, page navigation, and improve user experience.</p>
              </div>

              {/* Marketing */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900">Marketing &amp; Attribution</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                <p className="text-[11px] text-neutral-500">Meta Pixel &amp; conversion measurement to evaluate ad relevance and avoid showing redundant ads.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-200 rounded-lg"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-lg shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
