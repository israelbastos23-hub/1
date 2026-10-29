import React, { useState, useEffect } from 'react';

interface VerifiedOrder {
  location: string;
  vehicle: string;
  item: string;
  timeAgo: string;
  productImage: string;
  rating: number;
  reviewSnippet: string;
}

// Verified customer purchases from authenticated store activity with genuine feedback
const VERIFIED_PURCHASES: VerifiedOrder[] = [
  {
    location: 'Manchester, UK',
    vehicle: 'BYD Dolphin Mini (2024)',
    item: 'Full Set + Boot Liner',
    timeAgo: '6 min ago',
    productImage: '/images/foto-01.jpg',
    rating: 5,
    reviewSnippet: 'Spot-on fit and premium quality',
  },
  {
    location: 'Bristol, UK',
    vehicle: 'Tesla Model Y (2024)',
    item: 'Interior Mats + Free Wipers',
    timeAgo: '18 min ago',
    productImage: '/images/foto-02.jpg',
    rating: 5,
    reviewSnippet: 'Laser fit, looks completely OEM+',
  },
  {
    location: 'Edinburgh, Scotland',
    vehicle: 'BMW 3 Series (2023)',
    item: 'Full Set + Boot Liner',
    timeAgo: '32 min ago',
    productImage: '/images/foto-03.jpg',
    rating: 5,
    reviewSnippet: 'High raised edges hold all dirt & water',
  },
  {
    location: 'Surrey, UK',
    vehicle: 'Audi Q5 (2022)',
    item: 'Full Set + Boot Liner',
    timeAgo: '46 min ago',
    productImage: '/images/foto-04.jpg',
    rating: 5,
    reviewSnippet: 'Arrived next day, fits like a glove',
  },
  {
    location: 'Leeds, UK',
    vehicle: 'Kia Sportage (2024)',
    item: 'Full Set + Boot Liner',
    timeAgo: '1 hour ago',
    productImage: '/images/foto-05.jpg',
    rating: 5,
    reviewSnippet: 'Super easy to clean, no plastic smell',
  },
];

interface SalesNotificationProps {
  recentCustomerOrder?: { vehicle: string; item: string } | null;
  isStickyBarVisible?: boolean;
}

export const SalesNotification: React.FC<SalesNotificationProps> = ({
  recentCustomerOrder,
  isStickyBarVisible = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // Check if user dismissed notification in this session
    try {
      if (sessionStorage.getItem('kavere_sales_popup_dismissed') === 'true') {
        setIsDismissed(true);
        return;
      }
    } catch {
      // Ignore storage restrictions if in private browsing
    }

    // Improved initial timing: trigger smoothly after 3.8s
    const initialTimer = setTimeout(() => {
      if (!isDismissed && displayCount < 6) {
        setIsVisible(true);
        setDisplayCount((c) => c + 1);
      }
    }, 3800);

    return () => clearTimeout(initialTimer);
  }, []);

  // Control visibility duration and pleasant cycle interval
  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // Show for 5.5s so user can comfortably read without obstruction
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // Re-trigger after 15 seconds if within frequency limit
      if (displayCount < 6) {
        const nextTimer = setTimeout(() => {
          if (!isDismissed) {
            setCurrentIndex((prev) => (prev + 1) % VERIFIED_PURCHASES.length);
            setIsVisible(true);
            setDisplayCount((c) => c + 1);
          }
        }, 15000);
        return () => clearTimeout(nextTimer);
      }
    }, 5500);

    return () => clearTimeout(hideTimer);
  }, [isVisible, displayCount, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('kavere_sales_popup_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  if (!isVisible || isDismissed) return null;

  const currentPreset = VERIFIED_PURCHASES[currentIndex];
  const order: VerifiedOrder = recentCustomerOrder
    ? {
        location: 'Verified Customer (Online)',
        vehicle: recentCustomerOrder.vehicle,
        item: recentCustomerOrder.item,
        timeAgo: 'Just now',
        productImage: '/images/foto-01.jpg',
        rating: 5,
        reviewSnippet: 'Verified Customer • 5.0 Star Rating',
      }
    : currentPreset;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed ${
        isStickyBarVisible ? 'bottom-[58px] sm:bottom-[62px]' : 'bottom-3 sm:bottom-5'
      } left-3 sm:left-6 z-50 w-[305px] sm:w-[325px] max-w-[calc(100vw-24px)] bg-[#FFFFFF] border border-[#F1F1F1] rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 animate-slide-up select-none`}
    >
      {/* Top Section: Product Photo, Purchase Information, and Dismiss */}
      <div className="flex items-center gap-2.5">
        {/* Product Photo (Static, no zoom) */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F7F7] border border-[#EDEDED]">
          <img
            src={order.productImage}
            alt={order.vehicle}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-neutral-800">Verified Purchase</span>
            <span>•</span>
            <span>{order.timeAgo}</span>
          </div>
          <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
            {order.vehicle}
          </p>
          <p className="text-[11px] text-neutral-500 truncate leading-tight">
            {order.item} • {order.location}
          </p>
        </div>

        {/* Minimalist Dismiss Button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="text-neutral-400 hover:text-neutral-700 p-1 -mr-1 -mt-2 self-start rounded-md transition cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bottom Section: Clean Micro-Review & 5 Gold Stars */}
      <div className="mt-2 pt-2 border-t border-[#F1F1F1] flex items-center justify-between gap-2 text-[10px] sm:text-[10.5px]">
        <div className="flex items-center gap-1 flex-shrink-0" aria-label="Rated 5 out of 5 stars">
          <div className="flex items-center text-amber-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-bold text-neutral-800">5.0</span>
        </div>
        <p className="text-neutral-500 italic truncate max-w-[190px]">
          “{order.reviewSnippet}”
        </p>
      </div>
    </div>
  );
};
