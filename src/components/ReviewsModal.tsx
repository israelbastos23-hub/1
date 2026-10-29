import React, { useRef } from 'react';
import { REVIEWS } from '../data/reviews';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose }) => {
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll support without visual arrows or indicators
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    if (reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'none';
      reviewsCarouselRef.current.style.scrollBehavior = 'auto';
    }
    startX.current = e.pageX - (reviewsCarouselRef.current?.offsetLeft || 0);
    scrollLeftVal.current = reviewsCarouselRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    if (isDown.current && reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'x mandatory';
      reviewsCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDown.current = false;
  };

  const handleMouseUp = () => {
    if (isDown.current && reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'x mandatory';
      reviewsCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !reviewsCarouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (reviewsCarouselRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    reviewsCarouselRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    const target = e.currentTarget;
    if (!target.dataset.hasTried) {
      target.dataset.hasTried = '1';
      target.src = fallbackSrc;
    } else {
      // If customer provided no photo or file is missing, hide the image slot cleanly
      target.style.display = 'none';
      if (target.parentElement) {
        target.parentElement.style.display = 'none';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
        <div className="relative bg-[#FFFFFF] rounded-2xl text-left overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] transform transition-all sm:my-8 sm:max-w-2xl sm:w-full border border-[#F1F1F1]">
          <div className="px-6 py-4 border-b border-[#F1F1F1] flex items-center justify-between bg-[#F7F7F7]">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">Customer Reviews</h3>
              <p className="text-xs text-neutral-500">Verified owners of Kavere 3D Car Mats</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-black p-1 rounded-md transition cursor-pointer"
              aria-label="Close reviews"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 bg-[#FFFFFF]">
            {/* Rating Summary Header */}
            <div className="bg-[#F7F7F7] rounded-xl p-4 flex items-center justify-between border border-[#F1F1F1] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-neutral-900">4.7</span>
                <div>
                  <div className="text-neutral-900 text-sm tracking-widest">★★★★★</div>
                  <div className="text-[11px] text-neutral-500 font-medium">Based on 109 UK verified reviews</div>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  96% Recommend
                </span>
              </div>
            </div>

            {/* Horizontal Swipeable Reviews Photos Carousel */}
            <div
              ref={reviewsCarouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none gap-3.5 pb-2 cursor-grab active:cursor-grabbing select-none"
              style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
            >
              {/* Review 1 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-01.jpg"
                    alt="Customer photo review by Mark T."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-01.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[0].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[0].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[0].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[0].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[0].comment}</p>
              </div>

              {/* Review 2 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-02.jpg"
                    alt="Customer photo review by Sarah L."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-02.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[1].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[1].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[1].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[1].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[1].comment}</p>
              </div>

              {/* Review 3 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-03.jpg"
                    alt="Customer photo review by David P."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-03.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[2].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[2].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[2].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[2].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[2].comment}</p>
              </div>

              {/* Review 4 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-04.jpg"
                    alt="Customer photo review by James R."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-04.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[3].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[3].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★☆</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[3].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[3].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[3].comment}</p>
              </div>

              {/* Review 5 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-05.jpg"
                    alt="Customer photo review by Emma W."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-05.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[4].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[4].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[4].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[4].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[4].comment}</p>
              </div>

              {/* Review 6 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-06.jpg"
                    alt="Customer photo review by Oliver G."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-06.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[5].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[5].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[5].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[5].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[5].comment}</p>
              </div>

              {/* Review 7 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-07.jpg"
                    alt="Customer photo review by Daniel K."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-07.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[6].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[6].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[6].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[6].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[6].comment}</p>
              </div>

              {/* Review 8 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-08.jpg"
                    alt="Customer photo review by Charlotte B."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-08.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[7].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[7].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[7].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[7].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[7].comment}</p>
              </div>

              {/* Review 9 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-09.jpg"
                    alt="Customer photo review by Liam H."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-09.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[8].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[8].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[8].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[8].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[8].comment}</p>
              </div>

              {/* Review 10 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-10.jpg"
                    alt="Customer photo review by Sophie M."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-10.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[9].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[9].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[9].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[9].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[9].comment}</p>
              </div>

              {/* Review 11 Card */}
              <div className="w-[280px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="h-36 w-full rounded-lg overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                  <img
                    src="/images/review-11.jpg"
                    alt="Customer photo review by Thomas E."
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => handleImageError(e, '/review-11.jpg')}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{REVIEWS[10].author}</span>
                  <span className="text-[10px] text-neutral-400">{REVIEWS[10].date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-900">★★★★★</span>
                  <span className="text-[10px] bg-[#FFFFFF] border border-[#F1F1F1] font-semibold px-1.5 py-0.5 rounded text-neutral-700">
                    {REVIEWS[10].vehicle}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[10].title}</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{REVIEWS[10].comment}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-[#F7F7F7] border-t border-[#F1F1F1] text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-neutral-900 hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
