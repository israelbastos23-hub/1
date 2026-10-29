import React, { useState, useMemo, useRef, useEffect } from 'react';
import { POPULAR_MAKES, YEARS } from './data/vehicles';
import { REVIEWS } from './data/reviews';
import { SetOption } from './types';
import { ReviewsModal } from './components/ReviewsModal';
import { PolicyModal, PolicyType } from './components/PolicyModal';
import { SalesNotification } from './components/SalesNotification';
import { StickyBuyBar } from './components/StickyBuyBar';
import { buildCleanCheckoutUrl } from './utils/checkoutUrl';

// Official Brand Logo
const LOGO_SRC = '/assets/aistudio/logo_kavere_3e05dc49.png';

// Proteção prática e elegância feature images
const PROTECAO_01_SRC = '/images/protecao-01.jpg';
const PROTECAO_02_SRC = '/images/protecao-02.jpg';
const PROTECAO_03_SRC = '/images/protecao-03.jpg';

export default function App() {
  // Vehicle Selection State
  const [selectedMake, setSelectedMake] = useState('BYD');
  const [selectedModel, setSelectedModel] = useState('Dolphin Mini');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');

  // Set Selection State ('interior' or 'full')
  // foto-01 is full set (Interior + Boot + Wipers), foto-02 is interior set (Interior + Wipers)
  const [selectedSet, setSelectedSet] = useState<SetOption>('full');

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Active Photo Index in product carousel (0 to 7)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

  // Product Carousel ref
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  // Reviews Carousel ref
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);

  // Mouse drag support for product carousel
  const isDownProduct = useRef(false);
  const startXProduct = useRef(0);
  const scrollLeftProduct = useRef(0);

  // Mouse drag support for reviews carousel
  const isDownReview = useRef(false);
  const startXReview = useRef(0);
  const scrollLeftReview = useRef(0);

  // Refs for smooth navigation
  const productOptionsRef = useRef<HTMLDivElement>(null);
  const setSelectorRef = useRef<HTMLDivElement>(null);
  const vehicleSelectorRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLElement>(null);

  // Sticky Buy Bar & Sales Pop-up State
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [highlightVehicleSelector, setHighlightVehicleSelector] = useState(false);
  const [recentCustomerOrder, setRecentCustomerOrder] = useState<{ vehicle: string; item: string } | null>(null);

  // Show sticky buy bar as user begins scrolling down the page
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Review image error handler: if customer has no photo or file is removed, hide the slot cleanly
  const handleReviewImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    const target = e.currentTarget;
    if (!target.dataset.hasTried) {
      target.dataset.hasTried = '1';
      target.src = fallbackSrc;
    } else {
      target.style.display = 'none';
      if (target.parentElement) {
        target.parentElement.style.display = 'none';
      }
    }
  };

  // Available models for current make
  const availableModels = useMemo(() => {
    const makeObj = POPULAR_MAKES.find((m) => m.make === selectedMake);
    return makeObj ? makeObj.models : ['Other model'];
  }, [selectedMake]);

  // Pricing calculation: Interior Mats + Boot Mat + Free Wipers is £49.90
  const isFullSet = selectedSet === 'full';
  const currentPrice = isFullSet ? 49.90 : 39.90;
  const originalPrice = isFullSet ? 99.90 : 79.90;
  const currentSetTitle = isFullSet
    ? 'Interior Mats + Boot Mat + Free Wipers'
    : 'Interior Mats + Free Wipers';

  // Function to scroll product carousel to specific photo index
  const scrollToPhoto = (index: number) => {
    if (!productCarouselRef.current) return;
    const container = productCarouselRef.current;
    const targetLeft = index * container.clientWidth;
    isScrollingProgrammatically.current = true;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActivePhotoIndex(index);
    // Linkagem: Foto 1 -> Interior Mats + Boot Mat + Free Wipers, Foto 2 -> Interior Mats + Free Wipers
    if (index === 0) {
      setSelectedSet('full');
    } else if (index === 1) {
      setSelectedSet('interior');
    }
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 600);
  };

  // Two-way linking: When SET changes, slide to corresponding photo
  const handleSelectSet = (set: SetOption) => {
    setSelectedSet(set);
    if (set === 'full') {
      scrollToPhoto(0); // foto-01.jpg
    } else {
      scrollToPhoto(1); // foto-02.jpg
    }
  };

  // On carousel scroll: sync active photo index and two-way link to set selection
  const handleProductCarouselScroll = () => {
    if (isScrollingProgrammatically.current || !productCarouselRef.current) return;
    const container = productCarouselRef.current;
    const width = container.clientWidth;
    if (width <= 0) return;
    const newIndex = Math.round(container.scrollLeft / width);
    if (newIndex >= 0 && newIndex <= 7) {
      if (newIndex !== activePhotoIndex) {
        setActivePhotoIndex(newIndex);
      }
      // Linkagem: foto 1 para Interior Mats + Boot Mat + Free Wipers
      if (newIndex === 0 && selectedSet !== 'full') {
        setSelectedSet('full');
      }
      // Linkagem: foto 2 para Interior Mats + Free Wipers
      else if (newIndex === 1 && selectedSet !== 'interior') {
        setSelectedSet('interior');
      }
    }
  };

  // Product Carousel Mouse Drag Handlers
  const handleProductMouseDown = (e: React.MouseEvent) => {
    isDownProduct.current = true;
    if (productCarouselRef.current) {
      productCarouselRef.current.style.scrollSnapType = 'none';
      productCarouselRef.current.style.scrollBehavior = 'auto';
    }
    startXProduct.current = e.pageX - (productCarouselRef.current?.offsetLeft || 0);
    scrollLeftProduct.current = productCarouselRef.current?.scrollLeft || 0;
  };
  const handleProductMouseLeave = () => {
    if (isDownProduct.current && productCarouselRef.current) {
      productCarouselRef.current.style.scrollSnapType = 'x mandatory';
      productCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDownProduct.current = false;
  };
  const handleProductMouseUp = () => {
    if (isDownProduct.current && productCarouselRef.current) {
      productCarouselRef.current.style.scrollSnapType = 'x mandatory';
      productCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDownProduct.current = false;
  };
  const handleProductMouseMove = (e: React.MouseEvent) => {
    if (!isDownProduct.current || !productCarouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (productCarouselRef.current.offsetLeft || 0);
    const walk = (x - startXProduct.current) * 1.5;
    productCarouselRef.current.scrollLeft = scrollLeftProduct.current - walk;
  };

  // Reviews Carousel Mouse Drag Handlers
  const handleReviewMouseDown = (e: React.MouseEvent) => {
    isDownReview.current = true;
    if (reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'none';
      reviewsCarouselRef.current.style.scrollBehavior = 'auto';
    }
    startXReview.current = e.pageX - (reviewsCarouselRef.current?.offsetLeft || 0);
    scrollLeftReview.current = reviewsCarouselRef.current?.scrollLeft || 0;
  };
  const handleReviewMouseLeave = () => {
    if (isDownReview.current && reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'x mandatory';
      reviewsCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDownReview.current = false;
  };
  const handleReviewMouseUp = () => {
    if (isDownReview.current && reviewsCarouselRef.current) {
      reviewsCarouselRef.current.style.scrollSnapType = 'x mandatory';
      reviewsCarouselRef.current.style.scrollBehavior = 'smooth';
    }
    isDownReview.current = false;
  };
  const handleReviewMouseMove = (e: React.MouseEvent) => {
    if (!isDownReview.current || !reviewsCarouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (reviewsCarouselRef.current.offsetLeft || 0);
    const walk = (x - startXReview.current) * 1.5;
    reviewsCarouselRef.current.scrollLeft = scrollLeftReview.current - walk;
  };

  // Handle Make Change
  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMake = e.target.value;
    setSelectedMake(newMake);
    const makeObj = POPULAR_MAKES.find((m) => m.make === newMake);
    if (makeObj && makeObj.models.length > 0) {
      setSelectedModel(makeObj.models[0]);
    } else {
      setSelectedModel('Other model');
    }
  };

  // Redirect directly to checkout with selected items quantity & configuration
  const handleProceedToCheckout = () => {
    if (selectedMake === 'Other make' && !customMake.trim()) {
      setHighlightVehicleSelector(true);
      vehicleSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setToastMessage('Please specify your custom vehicle make above.');
      setTimeout(() => setHighlightVehicleSelector(false), 3500);
      return;
    }

    if (selectedModel === 'Other model' && !customModel.trim()) {
      setHighlightVehicleSelector(true);
      vehicleSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setToastMessage('Please specify your custom vehicle model above.');
      setTimeout(() => setHighlightVehicleSelector(false), 3500);
      return;
    }

    const displayMake = selectedMake === 'Other make' ? customMake.trim() : selectedMake;
    const displayModel = selectedModel === 'Other model' ? customModel.trim() : selectedModel;

    // Construct destination checkout link with quantity, vehicle specifications, and deduplicated UTMify tracking
    // Set 1 (Interior Mats + Boot Mat + Free Wipers - 49.90): https://checkout.pagou.ai/checkout/chk_01M64TX0D1DN30CSRR6697Z72S
    // Set 2 (Interior Mats + Free Wipers - 39.90): https://checkout.pagou.ai/checkout/chk_01M645CKKW6NABB92Q1YJW93PS
    const checkoutBaseUrl = isFullSet
      ? 'https://checkout.pagou.ai/checkout/chk_01M64TX0D1DN30CSRR6697Z72S'
      : 'https://checkout.pagou.ai/checkout/chk_01M645CKKW6NABB92Q1YJW93PS';

    const unitPrice = isFullSet ? 49.90 : 39.90;
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    // Fire Meta Pixel AddToCart event if fbq is initialized
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      try {
        const atcEventId = `atc_1172958688595387_${Date.now()}`;
        (window as any).fbq(
          'track',
          'AddToCart',
          {
            content_name: currentSetTitle,
            content_category: 'Car Accessories',
            content_ids: [isFullSet ? 'chk_01M64TX0D1DN30CSRR6697Z72S' : 'chk_01M645CKKW6NABB92Q1YJW93PS'],
            content_type: 'product',
            value: totalPrice,
            currency: 'GBP',
            num_items: quantity,
            vehicle: `${displayMake} - ${displayModel} (${selectedYear})`,
          },
          { eventID: atcEventId }
        );
      } catch (_) {}
    }

    const finalCheckoutUrl = buildCleanCheckoutUrl(checkoutBaseUrl, {
      quantity: String(quantity),
      qtd: String(quantity),
      add_to_cart: '1',
      add_to_basket: '1',
      make: displayMake,
      model: displayModel,
      year: selectedYear,
      vehicle: `${displayMake} - ${displayModel} (${selectedYear})`,
      title: currentSetTitle,
    });

    setRecentCustomerOrder({
      vehicle: `${displayMake} • ${displayModel} (${selectedYear})`,
      item: currentSetTitle,
    });

    setToastMessage(`Redirecting to checkout (${quantity} ${quantity > 1 ? 'items' : 'item'})...`);

    setTimeout(() => {
      try {
        window.location.href = finalCheckoutUrl;
      } catch (_) {
        window.open(finalCheckoutUrl, '_blank');
      }
    }, 400);
  };

  // Sticky Buy Bar Action
  const handleStickyBuyClick = () => {
    handleProceedToCheckout();
  };

  const scrollToOptions = () => {
    productOptionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    productOptionsRef.current?.classList.add('ring-2', 'ring-black');
    setTimeout(() => {
      productOptionsRef.current?.classList.remove('ring-2', 'ring-black');
    }, 1800);
  };

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Active display vehicle label
  const activeVehicleLabel = `${
    selectedMake === 'Other make' ? customMake || 'Other Make' : selectedMake
  } • ${
    selectedModel === 'Other model' ? customModel || 'Other Model' : selectedModel
  } • ${selectedYear}`;

  return (
    <div className={`font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white min-h-screen flex flex-col bg-[#FFFFFF] ${showStickyBar ? 'pb-12 sm:pb-14' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-neutral-700 animate-slide-in">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />

      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />

      {/* BEGIN: AnnouncementBar */}
      <div
        className="bg-black text-white text-[11px] sm:text-xs tracking-wider uppercase text-center py-2 font-medium cursor-pointer hover:bg-neutral-900 transition"
        data-purpose="top-announcement"
        onClick={() => setPolicyModal('customs')}
      >
        FREE UK SHIPPING ON ALL ORDERS
      </div>
      {/* END: AnnouncementBar */}

      {/* BEGIN: NavigationHeader */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left navigation links */}
          <nav className="flex items-center space-x-3 sm:space-x-5 text-sm font-medium text-gray-700 w-28 sm:w-36">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-black text-white px-2.5 sm:px-3 py-1 rounded text-xs tracking-wide cursor-pointer transition hover:bg-neutral-800 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => setPolicyModal('contact')}
              className="hover:text-black transition-colors text-xs font-medium tracking-wide cursor-pointer text-gray-700"
            >
              Contact
            </button>
          </nav>

          {/* Center Logo */}
          <div className="flex items-center justify-center flex-1">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center cursor-pointer group py-1"
              aria-label="Kavere Car Home"
            >
              <img
                src={LOGO_SRC}
                alt="Kavere Car"
                className="h-9 sm:h-11 w-auto object-contain transition group-hover:opacity-90 mix-blend-multiply"
              />
            </button>
          </div>

          {/* Right Spacer (sacola e lupinha removidas) */}
          <div className="w-28 sm:w-36 flex justify-end" />
        </div>
      </header>
      {/* END: NavigationHeader */}

      <main className="flex-1">
        {/* BEGIN: ProductHeroSection */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Responsive Swipeable Photo Carousel (NO arrows, NO dots, NO numbers) */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Product Carousel Container */}
              <div
                className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm aspect-square max-h-[460px] mx-auto w-full flex items-center justify-center"
              >
                {/* Horizontal Swipeable Carousel: each photo has its own independent <img> tag */}
                <div
                  ref={productCarouselRef}
                  onScroll={handleProductCarouselScroll}
                  onMouseDown={handleProductMouseDown}
                  onMouseLeave={handleProductMouseLeave}
                  onMouseUp={handleProductMouseUp}
                  onMouseMove={handleProductMouseMove}
                  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none w-full h-full cursor-grab active:cursor-grabbing select-none"
                  style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
                >
                  {/* Foto 1: Interior Mats + Boot Mat + Free Wipers */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-01.jpg"
                      alt="Interior Mats + Boot Mat + Free Wipers"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 2: Interior Mats + Free Wipers */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-02.jpg"
                      alt="Interior Mats + Free Wipers"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 3: Driver footwell */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-03.jpg"
                      alt="Front Driver Footwell"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 4: Passenger footwell */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-04.jpg"
                      alt="Front Passenger Footwell"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 5: Rear passenger row */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-05.jpg"
                      alt="Rear Passenger Row"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 6: SUV boot liner */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-06.jpg"
                      alt="SUV Boot Liner"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 7: Sedan boot liner */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-07.jpg"
                      alt="Sedan Boot Liner"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Foto 8: Truck bed liner */}
                  <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                    <img
                      src="/images/foto-08.jpg"
                      alt="Truck Bed Liner"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Each has its own independent <img> tag */}
              <div className="relative flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
                {/* Thumbnail 1: Foto 01 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(0)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 0
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Interior Mats + Boot Mat + Free Wipers"
                >
                  <img
                    src="/images/foto-01.jpg"
                    alt="Foto 01"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 2: Foto 02 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(1)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 1
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Interior Mats + Free Wipers"
                >
                  <img
                    src="/images/foto-02.jpg"
                    alt="Foto 02"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 3: Foto 03 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(2)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 2
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Driver Footwell"
                >
                  <img
                    src="/images/foto-03.jpg"
                    alt="Foto 03"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 4: Foto 04 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(3)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 3
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Passenger Footwell"
                >
                  <img
                    src="/images/foto-04.jpg"
                    alt="Foto 04"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 5: Foto 05 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(4)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 4
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Rear Passenger Row"
                >
                  <img
                    src="/images/foto-05.jpg"
                    alt="Foto 05"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 6: Foto 06 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(5)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 5
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="SUV Boot Liner"
                >
                  <img
                    src="/images/foto-06.jpg"
                    alt="Foto 06"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 7: Foto 07 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(6)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 6
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Sedan Boot Liner"
                >
                  <img
                    src="/images/foto-07.jpg"
                    alt="Foto 07"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>

                {/* Thumbnail 8: Foto 08 */}
                <button
                  type="button"
                  onClick={() => scrollToPhoto(7)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                    activePhotoIndex === 7
                      ? 'border-2 border-black opacity-100 shadow-xs'
                      : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  title="Truck Bed Liner"
                >
                  <img
                    src="/images/foto-08.jpg"
                    alt="Foto 08"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              </div>
            </div>

            {/* Right: Product Purchasing Form */}
            <div className="lg:col-span-6 space-y-4" ref={productOptionsRef}>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                  3D Car Mats – Full Set + Free Wipers
                </h1>
                {/* Price and Discount Tag */}
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    £{currentPrice.toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    £{originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase flex items-center gap-1">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12.707 2.293l9 9c.391.391.391 1.023 0 1.414l-7 7c-.391.391-1.023.391-1.414 0l-9-9A1.99 1.99 0 0 1 3.707 9.293V4a2 2 0 0 1 2-2h5.293a2 2 0 0 1 1.414.586zM7 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                    </svg>
                    SAVE 50%
                  </span>
                </div>
              </div>

              {/* Feature Callout Card - Enhanced readability, comfortable contrast & dynamic look */}
              <div className="bg-[#fbfbfb] border border-[#e8eaed] rounded-2xl p-4 sm:p-5 space-y-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-900 text-white shadow-xs">
                    3D PREMIUM CAR MATS
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-neutral-900 leading-snug">
                  Practical interior protection designed around your selected vehicle.
                </h3>

                <ul className="text-xs sm:text-[13px] text-neutral-700 space-y-2.5 pt-1 font-normal leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#edf8f1] text-[#147a43] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border border-[#cdebd6]">
                      ✓
                    </span>
                    <span>
                      <strong className="font-semibold text-neutral-900">Raised edges</strong> help contain everyday dirt, moisture, and small spills.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#edf8f1] text-[#147a43] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border border-[#cdebd6]">
                      ✓
                    </span>
                    <span>
                      <strong className="font-semibold text-neutral-900">Water-resistant surface</strong> designed for straightforward everyday cleaning.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#edf8f1] text-[#147a43] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border border-[#cdebd6]">
                      ✓
                    </span>
                    <span>
                      <strong className="font-semibold text-neutral-900">Durable finish</strong> engineered to hold its shape during normal use.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Vehicle Selector Card */}
              <div
                ref={vehicleSelectorRef}
                className={`border rounded-xl p-3.5 bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3 transition-all duration-300 ${
                  highlightVehicleSelector
                    ? 'border-black ring-2 ring-black bg-[#F7F7F7]'
                    : 'border-[#F1F1F1]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-[#F7F7F7] border border-[#F1F1F1] rounded-lg text-neutral-700 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Which car do you drive?</h4>
                    <p className="text-[11px] text-neutral-500">
                      Select make, model and year for laser-measured custom fitment.
                    </p>
                  </div>
                </div>

                {/* Selectors Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Make</label>
                    <select
                      value={selectedMake}
                      onChange={handleMakeChange}
                      className="w-full rounded-lg border border-[#F1F1F1] text-xs py-1.5 px-2 bg-[#F7F7F7] focus:border-black focus:ring-black cursor-pointer font-medium"
                    >
                      {POPULAR_MAKES.map((m) => (
                        <option key={m.make} value={m.make}>
                          {m.make}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full rounded-lg border border-[#F1F1F1] text-xs py-1.5 px-2 bg-[#F7F7F7] focus:border-black focus:ring-black cursor-pointer font-medium"
                    >
                      {availableModels.map((mdl) => (
                        <option key={mdl} value={mdl}>
                          {mdl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full rounded-lg border border-[#F1F1F1] text-xs py-1.5 px-2 bg-[#F7F7F7] focus:border-black focus:ring-black cursor-pointer font-medium"
                    >
                      {YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom inputs if Other Make / Model is selected */}
                {(selectedMake === 'Other make' || selectedModel === 'Other model') && (
                  <div className="pt-0.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedMake === 'Other make' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Specify Make</label>
                        <input
                          type="text"
                          placeholder="e.g. Polestar, MG, Cupra"
                          value={customMake}
                          onChange={(e) => setCustomMake(e.target.value)}
                          className="w-full rounded-lg border border-[#F1F1F1] text-xs py-1 px-2 bg-[#F7F7F7]"
                        />
                      </div>
                    )}
                    {selectedModel === 'Other model' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Specify Model</label>
                        <input
                          type="text"
                          placeholder="e.g. Polestar 2, MG4 EV"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          className="w-full rounded-lg border border-[#F1F1F1] text-xs py-1 px-2 bg-[#F7F7F7]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Selection Confirmation Badge */}
                <div
                  className="rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium transition-all shadow-[0_1px_4px_rgba(20,122,67,0.06)] border border-[#bce4cb]"
                  style={{
                    backgroundColor: '#edf8f1',
                    color: '#147a43',
                  }}
                >
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: '#147a43' }}>✓</span>
                  <span className="leading-snug" style={{ color: '#147a43' }}>
                    Vehicle selected:{' '}
                    <strong className="font-bold tracking-wide" style={{ color: '#147a43' }}>
                      {activeVehicleLabel}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Configuration Selector: Linked with Foto 1 and Foto 2 */}
              <div className="space-y-1.5" ref={setSelectorRef}>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">SET</label>
                <div className="flex flex-wrap gap-2">
                  {/* Foto 2 Linked */}
                  <button
                    onClick={() => handleSelectSet('interior')}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition cursor-pointer ${
                      selectedSet === 'interior'
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-[#FFFFFF] text-neutral-800 border-[#F1F1F1] hover:border-black'
                    }`}
                    type="button"
                  >
                    Interior Mats + Free Wipers
                  </button>

                  {/* Foto 1 Linked */}
                  <button
                    onClick={() => handleSelectSet('full')}
                    className={`text-xs font-medium px-3.5 py-2 rounded-full border transition cursor-pointer ${
                      selectedSet === 'full'
                        ? 'bg-black text-white border-black shadow-xs font-semibold'
                        : 'bg-[#FFFFFF] text-neutral-800 border-[#F1F1F1] hover:border-black'
                    }`}
                    type="button"
                  >
                    Interior Mats + Boot Mat + Free Wipers
                  </button>
                </div>
              </div>

              {/* Quantity & Purchase Button */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">Quantity</div>
                  {/* Counter */}
                  <div className="flex items-center border border-[#F1F1F1] bg-[#F7F7F7] rounded-lg px-2 py-1 text-xs font-semibold">
                    <button
                      className="text-neutral-500 hover:text-black px-1.5 cursor-pointer disabled:opacity-40"
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="px-2 select-none">{quantity}</span>
                    <button
                      className="text-neutral-500 hover:text-black px-1.5 cursor-pointer"
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  data-action="add-to-cart"
                  data-event="AddToCart"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-lg text-xs sm:text-sm tracking-wider uppercase transition shadow-md cursor-pointer active:scale-[0.99] flex items-center justify-center"
                  type="button"
                >
                  <span>ADD TO BASKET</span>
                </button>
              </div>

              {/* Shipping / Guarantee Badges */}
              <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center text-[11px] text-neutral-600">
                <button
                  type="button"
                  onClick={() => setPolicyModal('customs')}
                  className="flex items-center justify-center gap-1 font-medium hover:text-black transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Free Shipping</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyModal('refund')}
                  className="flex items-center justify-center gap-1 font-medium hover:text-black transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Easy Returns</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="flex items-center justify-center gap-1 font-medium hover:text-black transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Secure Checkout</span>
                </button>
              </div>

              {/* Customer Review Aggregate */}
              <button
                type="button"
                onClick={scrollToReviews}
                className="w-full flex items-center justify-center gap-1.5 pt-0.5 text-xs font-semibold text-neutral-900 cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-black tracking-tight text-sm">★★★★★</span>
                <span>4.7/5</span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-600 font-medium underline">109 reviews</span>
              </button>
            </div>
          </div>
        </section>
        {/* END: ProductHeroSection */}

        {/* BEGIN: FeatureSectionOverview */}
        <section className="bg-[#F7F7F7] border-t border-b border-[#F1F1F1] py-10 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold block">
                — 3D PREMIUM CAR MATS • BOOT LINER • FULL SET
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Practical protection for everyday driving
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Designed to help keep your vehicle interior cleaner while giving footwells and boot a tidy, fitted appearance.
              </p>
            </div>

            {/* Feature Split Box */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-4xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#F1F1F1] bg-[#FFFFFF]">
                <img
                  src="/images/protecao-01.jpg"
                  alt="3D Premium Car Mats & Boot Liner Feature Infographic"
                  className="w-full h-auto object-cover pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = '/protecao-01.jpg';
                  }}
                />
              </div>
              <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-2xl p-6 sm:p-7 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 block">
                  — PRODUCT DETAILS
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                  Designed for straightforward day-to-day use
                </h3>
                <ul className="text-xs text-neutral-600 space-y-2.5 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Raised edges help contain dirt, moisture and small everyday spills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Water-resistant surface is easy to wipe or rinse clean.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Vehicle selection helps us identify the most suitable fit for your make, model and year.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>The full-set option includes interior mats and a boot liner where available.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4 Columns Mini Grid */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">Raised-edge design</h4>
                <p className="text-[11px] text-neutral-500">Helps keep everyday mess within the mat area.</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">Easy maintenance</h4>
                <p className="text-[11px] text-neutral-500">Simple cleaning with water and mild soap.</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">Vehicle-based selection</h4>
                <p className="text-[11px] text-neutral-500">Choose make, model and year before ordering.</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">Boot liner option</h4>
                <p className="text-[11px] text-neutral-500">Available as part of the full set combo.</p>
              </div>
            </div>
          </div>
        </section>
        {/* END: FeatureSectionOverview */}

        {/* BEGIN: DetailedFeatureSection1 */}
        <section className="bg-[#FFFFFF] py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="rounded-2xl overflow-hidden border border-[#F1F1F1] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <img
                  src="/images/protecao-02.jpg"
                  alt="Mat with exceptional durability and strength raised edge"
                  className="w-full h-auto object-cover pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = '/protecao-02.jpg';
                  }}
                />
              </div>
              <div className="bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-6 sm:p-7 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 block">
                  — RAISED EDGES
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                  Helps contain everyday dirt and moisture
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The tray-style edge is designed to help keep mud, dust, moisture and small debris on the mat, making routine interior cleaning easier.
                </p>
                <ul className="text-xs text-neutral-600 space-y-2 pt-0.5">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Helps reduce direct contact between everyday mess and the original carpet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Suitable for normal daily driving and changing UK weather conditions.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* END: DetailedFeatureSection1 */}

        {/* BEGIN: DetailedFeatureSection2 */}
        <section className="bg-[#FFFFFF] py-8 sm:py-12 border-t border-[#F1F1F1]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-6 sm:p-7 space-y-3 order-2 lg:order-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 block">
                  — VEHICLE SELECTION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                  Choose your make, model and year before ordering
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your selection helps us identify the most suitable mat set for your vehicle. As trims and floor layouts can vary, please check your vehicle details carefully before checkout.
                </p>
                <ul className="text-xs text-neutral-600 space-y-2 pt-0.5">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>Select your vehicle using the fields above.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-900 font-bold">✓</span>
                    <span>If your vehicle is not listed, use the "Other make" or "Other model" option.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[#F1F1F1] shadow-[0_4px_16px_rgba(0,0,0,0.04)] order-1 lg:order-2">
                <img
                  src="/images/protecao-03.jpg"
                  alt="Precision designed fit for each vehicle model"
                  className="w-full h-auto object-cover pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = '/protecao-03.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        {/* END: DetailedFeatureSection2 */}

        {/* BEGIN: BannerCTA */}
        <section className="bg-[#FFFFFF] py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-neutral-950 text-white rounded-2xl px-6 py-8 text-center space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Choose the set that suits your vehicle</h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
                Return to the product options, select the configuration you want and confirm your vehicle details before adding it to your basket.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={scrollToOptions}
                  className="inline-block bg-white text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg hover:bg-neutral-100 transition shadow-xs cursor-pointer active:scale-95"
                >
                  VIEW OPTIONS
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* END: BannerCTA */}

        {/* BEGIN: HowToOrderSection */}
        <section className="bg-[#F7F7F7] border-t border-[#F1F1F1] py-12 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
              — HOW TO ORDER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Four simple steps</h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Check the set and vehicle details before completing your purchase.
            </p>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* Step 1 */}
              <div
                onClick={() => {
                  setSelectorRef.current?.scrollIntoView({ behavior: 'smooth' });
                  setSelectorRef.current?.classList.add('ring-2', 'ring-black');
                  setTimeout(() => setSelectorRef.current?.classList.remove('ring-2', 'ring-black'), 1500);
                }}
                className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2 cursor-pointer hover:border-black transition"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">1</div>
                <h4 className="text-xs font-bold text-neutral-900">Choose your set</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Select interior mats or full set with boot liner.
                </p>
              </div>
              {/* Step 2 */}
              <div
                onClick={() => {
                  vehicleSelectorRef.current?.scrollIntoView({ behavior: 'smooth' });
                  vehicleSelectorRef.current?.classList.add('ring-2', 'ring-black');
                  setTimeout(() => vehicleSelectorRef.current?.classList.remove('ring-2', 'ring-black'), 1500);
                }}
                className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2 cursor-pointer hover:border-black transition"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">2</div>
                <h4 className="text-xs font-bold text-neutral-900">Select vehicle</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Choose make, model and year in the selector.
                </p>
              </div>
              {/* Step 3 */}
              <div
                onClick={() => {
                  vehicleSelectorRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2 cursor-pointer hover:border-black transition"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">3</div>
                <h4 className="text-xs font-bold text-neutral-900">Check details</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Confirm your vehicle configuration badge.
                </p>
              </div>
              {/* Step 4 */}
              <div
                onClick={() => {
                  handleProceedToCheckout();
                }}
                className="bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2 cursor-pointer hover:border-black transition"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">4</div>
                <h4 className="text-xs font-bold text-neutral-900">Checkout</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Proceed directly to checkout with your selected items.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: HowToOrderSection */}

        {/* BEGIN: Customer Reviews Carousel Section (Swipeable, NO arrows, NO dots, each has its own img tag) */}
        <section
          ref={reviewsSectionRef}
          id="reviews-section"
          className="max-w-4xl mx-auto px-4 sm:px-6 py-10 border-t border-neutral-100"
        >
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Customer Reviews</h2>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-900">
              <span className="text-black tracking-tight text-sm">★★★★★</span>
              <span>4.7/5</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Based on 109 UK verified reviews</span>
            </div>
          </div>

          {/* Swipeable Reviews Horizontal Carousel */}
          <div
            ref={reviewsCarouselRef}
            onMouseDown={handleReviewMouseDown}
            onMouseLeave={handleReviewMouseLeave}
            onMouseUp={handleReviewMouseUp}
            onMouseMove={handleReviewMouseMove}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none gap-4 pb-2 cursor-grab active:cursor-grabbing select-none"
            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
          >
            {/* Review Card 1 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-01.jpg"
                  alt="Customer Review Photo 01"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-01.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[0].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[0].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[0].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[0].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[0].comment}</p>
            </div>

            {/* Review Card 2 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-02.jpg"
                  alt="Customer Review Photo 02"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-02.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[1].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[1].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[1].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[1].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[1].comment}</p>
            </div>

            {/* Review Card 3 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-03.jpg"
                  alt="Customer Review Photo 03"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-03.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[2].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[2].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[2].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[2].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[2].comment}</p>
            </div>

            {/* Review Card 4 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-04.jpg"
                  alt="Customer Review Photo 04"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-04.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[3].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[3].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★☆</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[3].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[3].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[3].comment}</p>
            </div>

            {/* Review Card 5 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-05.jpg"
                  alt="Customer Review Photo 05"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-05.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[4].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[4].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[4].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[4].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[4].comment}</p>
            </div>

            {/* Review Card 6 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-06.jpg"
                  alt="Customer Review Photo 06"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-06.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[5].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[5].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[5].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[5].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[5].comment}</p>
            </div>

            {/* Review Card 7 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-07.jpg"
                  alt="Customer Review Photo 07"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-07.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[6].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[6].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[6].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[6].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[6].comment}</p>
            </div>

            {/* Review Card 8 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-08.jpg"
                  alt="Customer Review Photo 08"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-08.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[7].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[7].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[7].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[7].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[7].comment}</p>
            </div>

            {/* Review Card 9 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-09.jpg"
                  alt="Customer Review Photo 09"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-09.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[8].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[8].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[8].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[8].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[8].comment}</p>
            </div>

            {/* Review Card 10 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-10.jpg"
                  alt="Customer Review Photo 10"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-10.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[9].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[9].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[9].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[9].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[9].comment}</p>
            </div>

            {/* Review Card 11 */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-[#F7F7F7] border border-[#F1F1F1] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[#F1F1F1]">
                <img
                  src="/images/review-11.jpg"
                  alt="Customer Review Photo 11"
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => handleReviewImgError(e, '/review-11.jpg')}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">{REVIEWS[10].author}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">{REVIEWS[10].date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-900">★★★★★</span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FFFFFF] border border-[#F1F1F1] px-2 py-0.5 rounded">
                  {REVIEWS[10].vehicle}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">{REVIEWS[10].title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{REVIEWS[10].comment}</p>
            </div>
          </div>
        </section>
        {/* END: Customer Reviews Section */}

        {/* BEGIN: FAQSection */}
        <section className="bg-[#F7F7F7] border-t border-[#F1F1F1] py-12 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-neutral-900">Frequently asked questions</h2>
            <p className="text-xs text-neutral-500 mt-1">Useful information before you choose your set.</p>
            <div className="mt-6 space-y-2.5 text-left">
              {/* FAQ 1 */}
              <details className="group bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition">
                <summary className="flex justify-between items-center p-3.5 cursor-pointer font-medium text-xs sm:text-sm text-neutral-900 select-none">
                  <span>Are the mats waterproof?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-[#F1F1F1]">
                  Yes, the mats are manufactured from a high-density, waterproof material designed to withstand liquids, dirt, mud, and everyday spills without soaking through.
                </div>
              </details>

              {/* FAQ 2 */}
              <details className="group bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition">
                <summary className="flex justify-between items-center p-3.5 cursor-pointer font-medium text-xs sm:text-sm text-neutral-900 select-none">
                  <span>How do I clean them?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-[#F1F1F1]">
                  Simply wipe them down with a damp microfiber cloth or remove them from the vehicle and hose them off with water and mild automotive soap.
                </div>
              </details>

              {/* FAQ 3 */}
              <details className="group bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition">
                <summary className="flex justify-between items-center p-3.5 cursor-pointer font-medium text-xs sm:text-sm text-neutral-900 select-none">
                  <span>Is the boot liner included?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-[#F1F1F1]">
                  The boot liner is included when selecting the "Interior Mats + Boot Mat + Free Wipers" bundle option.
                </div>
              </details>

              {/* FAQ 4 */}
              <details className="group bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition">
                <summary className="flex justify-between items-center p-3.5 cursor-pointer font-medium text-xs sm:text-sm text-neutral-900 select-none">
                  <span>How is the fit selected?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-[#F1F1F1]">
                  Using the vehicle selector on this page, choose your vehicle's make, model, and year so our fulfillment team prepares the custom-fit laser-measured specification.
                </div>
              </details>

              {/* FAQ 5 */}
              <details className="group bg-[#FFFFFF] border border-[#F1F1F1] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition">
                <summary className="flex justify-between items-center p-3.5 cursor-pointer font-medium text-xs sm:text-sm text-neutral-900 select-none">
                  <span>What if I cannot find my vehicle?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-[#F1F1F1]">
                  Choose "Other make" and "Other model" in the vehicle dropdowns, and our customer support team will contact you to verify your vehicle details prior to dispatch.
                </div>
              </details>
            </div>
          </div>
        </section>
        {/* END: FAQSection */}
      </main>

      {/* BEGIN: Footer */}
      <footer className="bg-black text-white pt-10 pb-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-neutral-800 items-start">
            {/* Brand Logo & Info */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-2 inline-block">
                <img
                  src={LOGO_SRC}
                  alt="Kavere Car"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-neutral-400 max-w-xs">
                Premium 3D laser-measured custom car mats, boot liners, and automotive accessories with fast UK dispatch.
              </p>
            </div>

            {/* Policies Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white">POLICIES</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li>
                  <button
                    onClick={() => setPolicyModal('privacy')}
                    className="hover:text-white transition cursor-pointer text-left"
                  >
                    Privacy Choices
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPolicyModal('customs')}
                    className="hover:text-white transition cursor-pointer text-left"
                  >
                    Customs & Import Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPolicyModal('terms')}
                    className="hover:text-white transition cursor-pointer text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPolicyModal('legal')}
                    className="hover:text-white transition cursor-pointer text-left"
                  >
                    Legal Notice
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPolicyModal('refund')}
                    className="hover:text-white transition cursor-pointer text-left"
                  >
                    Return & Refund Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white">CONTACT</h4>
              <p className="text-xs text-neutral-400">
                <span className="text-white font-semibold">E-mail:</span>{' '}
                <button
                  onClick={() => setPolicyModal('contact')}
                  className="hover:text-white underline cursor-pointer"
                >
                  support@kavere-uk.com
                </button>
              </p>
              <p className="text-[11px] text-neutral-500">
                UK Support: Mon–Fri 8:00–18:00 GMT
              </p>
            </div>
          </div>

          {/* Copyright & Back to top */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3">
            <p>© 2026, Kavere Car. All rights reserved.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="text-neutral-400 hover:text-white p-1.5 transition cursor-pointer flex items-center gap-1"
            >
              <span>Back to top</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* Pop-up de Vendas: Minimalist Recent Verified Purchases Notification */}
      <SalesNotification
        recentCustomerOrder={recentCustomerOrder}
        isStickyBarVisible={showStickyBar}
      />

      {/* Barra Fixa de Compra: Sticky Quick Buy Bar */}
      <StickyBuyBar
        isVisible={showStickyBar}
        productImage={`/images/foto-0${activePhotoIndex + 1}.jpg`}
        vehicleLabel={activeVehicleLabel}
        setTitle={currentSetTitle}
        price={currentPrice}
        originalPrice={originalPrice}
        onBuyClick={handleStickyBuyClick}
      />
    </div>
  );
}
