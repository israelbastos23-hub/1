import { ProductConfig, TRACKING_CONFIG } from '../config/tracking';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    __lastTrackedPageView?: string;
  }
}

export interface VehicleInfo {
  make?: string;
  model?: string;
  year?: string;
}

export interface PurchaseOrder {
  transactionId: string;
  product: ProductConfig;
  quantity: number;
  totalPrice: number;
  vehicleInfo?: VehicleInfo;
  paymentMethod?: string;
  verificationSource?: 'webhook' | 'order_confirmation_page' | 'payment_gateway_callback';
}

export interface PaymentFailedInfo {
  transactionId?: string;
  product?: ProductConfig;
  quantity?: number;
  totalPrice?: number;
  errorCode?: string;
  errorMessage?: string;
}

// In-memory set to prevent double event firing in React strict mode or rapid re-renders
const dispatchedEventKeys = new Set<string>();

/**
 * Ensures window.dataLayer exists and pushes payload to it.
 */
function pushToDataLayer(payload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Generates a unique transaction identifier for attribution, deduplication,
 * and reconciliation between GTM, GA4, Meta, and payment webhooks.
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `tx_${timestamp}_${random}`;
}

/**
 * Retrieves a cookie value by name (e.g. _fbp, _fbc).
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Gathers current visitor attribution parameters (UTMs, Click IDs, FBP/FBC).
 */
export function getAttributionData(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof window === 'undefined') return result;

  try {
    const sp = new URLSearchParams(window.location.search);
    const trackingKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
      'gclid',
      'src',
      'sck',
      'subid',
      'subid2',
      'subid3',
      'subid4',
      'subid5',
    ];

    trackingKeys.forEach((key) => {
      const val = sp.get(key);
      if (val) result[key] = val.trim();
    });

    const fbp = getCookie('_fbp');
    if (fbp) result['fbp'] = fbp;

    const fbc = getCookie('_fbc') || (sp.get('fbclid') ? `fb.1.${Date.now()}.${sp.get('fbclid')}` : null);
    if (fbc) result['fbc'] = fbc;
  } catch (_) {}

  return result;
}

/**
 * 1. PAGE_VIEW: Track every page view via window.dataLayer
 * Guaranteed compatible with SPA navigation and protected against duplicates.
 */
export function trackPageView(pagePath?: string, pageTitle?: string): void {
  if (typeof window === 'undefined') return;

  const currentPath = pagePath || window.location.pathname;
  const currentTitle = pageTitle || document.title;
  const currentUrl = window.location.href;

  // Deduplicate rapid identical page_view triggers on the same route
  const pvKey = `pv_${currentPath}_${Math.floor(Date.now() / 2500)}`;
  if (dispatchedEventKeys.has(pvKey)) return;
  dispatchedEventKeys.add(pvKey);

  pushToDataLayer({
    event: 'page_view',
    page_location: currentUrl,
    page_path: currentPath,
    page_title: currentTitle,
    market: TRACKING_CONFIG.MARKET,
    currency: TRACKING_CONFIG.CURRENCY,
  });

  // Optional direct forwarding if GTM loaded them
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView', {}, { eventID: `pv_${Date.now()}` });
    } catch (_) {}
  }
}

/**
 * 2. VIEW_ITEM: Product view via window.dataLayer
 * Triggered on page load and whenever user toggles between product_3990 and product_4990.
 */
export function trackViewItem(product: ProductConfig, vehicleInfo?: VehicleInfo): void {
  if (typeof window === 'undefined') return;

  const eventKey = `view_item_${product.id}_${Math.floor(Date.now() / 4000)}`;
  if (dispatchedEventKeys.has(eventKey)) return;
  dispatchedEventKeys.add(eventKey);

  const vehicleString = vehicleInfo && vehicleInfo.make && vehicleInfo.make !== 'Select Make'
    ? `${vehicleInfo.make} ${vehicleInfo.model || ''} (${vehicleInfo.year || ''})`.trim()
    : undefined;

  // Clear previous ecommerce object per GA4 / GTM best practice
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: TRACKING_CONFIG.CURRENCY,
      value: product.price,
      market: TRACKING_CONFIG.MARKET,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          currency: TRACKING_CONFIG.CURRENCY,
          item_category: product.category,
          quantity: 1,
          item_brand: 'Kavere Car',
          vehicle_selection: vehicleString,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq(
        'track',
        'ViewContent',
        {
          content_name: product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: product.price,
          currency: TRACKING_CONFIG.CURRENCY,
        },
        { eventID: `vc_${product.id}_${Date.now()}` }
      );
    } catch (_) {}
  }
}

/**
 * 3. CHECKOUT_CLICK: User clicks on the buy button (ADD TO BASKET / Sticky Buy)
 */
export function trackCheckoutClick(
  product: ProductConfig,
  quantity: number,
  buttonName: string = 'ADD TO BASKET',
  vehicleInfo?: VehicleInfo
): void {
  if (typeof window === 'undefined') return;

  const totalPrice = Number((product.price * quantity).toFixed(2));
  const vehicleString = vehicleInfo && vehicleInfo.make && vehicleInfo.make !== 'Select Make'
    ? `${vehicleInfo.make} ${vehicleInfo.model || ''} (${vehicleInfo.year || ''})`.trim()
    : undefined;

  pushToDataLayer({
    event: 'checkout_click',
    button_name: buttonName,
    product_id: product.id,
    product_name: product.name,
    quantity: quantity,
    value: totalPrice,
    currency: TRACKING_CONFIG.CURRENCY,
    market: TRACKING_CONFIG.MARKET,
    vehicle_selection: vehicleString,
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq(
        'track',
        'AddToCart',
        {
          content_name: product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: totalPrice,
          currency: TRACKING_CONFIG.CURRENCY,
          num_items: quantity,
        },
        { eventID: `atc_${product.id}_${Date.now()}` }
      );
    } catch (_) {}
  }
}

/**
 * 4. BEGIN_CHECKOUT: User initiates entrance to checkout
 */
export function trackBeginCheckout(
  product: ProductConfig,
  quantity: number,
  transactionId: string,
  vehicleInfo?: VehicleInfo
): void {
  if (typeof window === 'undefined') return;

  const totalPrice = Number((product.price * quantity).toFixed(2));
  const vehicleString = vehicleInfo && vehicleInfo.make && vehicleInfo.make !== 'Select Make'
    ? `${vehicleInfo.make} ${vehicleInfo.model || ''} (${vehicleInfo.year || ''})`.trim()
    : undefined;

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: TRACKING_CONFIG.CURRENCY,
      value: totalPrice,
      market: TRACKING_CONFIG.MARKET,
      transaction_id: transactionId,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          currency: TRACKING_CONFIG.CURRENCY,
          item_category: product.category,
          quantity: quantity,
          item_brand: 'Kavere Car',
          vehicle_selection: vehicleString,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq(
        'track',
        'InitiateCheckout',
        {
          content_name: product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: totalPrice,
          currency: TRACKING_CONFIG.CURRENCY,
          num_items: quantity,
        },
        { eventID: `ic_${transactionId}` }
      );
    } catch (_) {}
  }
}

/**
 * 5. ADD_PAYMENT_INFO: Payment details submitted in checkout
 */
export function trackAddPaymentInfo(
  product: ProductConfig,
  quantity: number,
  paymentType: string = 'card',
  transactionId?: string
): void {
  if (typeof window === 'undefined') return;

  const totalPrice = Number((product.price * quantity).toFixed(2));

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'add_payment_info',
    ecommerce: {
      currency: TRACKING_CONFIG.CURRENCY,
      value: totalPrice,
      payment_type: paymentType,
      transaction_id: transactionId,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          currency: TRACKING_CONFIG.CURRENCY,
          item_category: product.category,
          quantity: quantity,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq(
        'track',
        'AddPaymentInfo',
        {
          content_ids: [product.id],
          content_type: 'product',
          value: totalPrice,
          currency: TRACKING_CONFIG.CURRENCY,
        },
        { eventID: `api_${transactionId || Date.now()}` }
      );
    } catch (_) {}
  }
}

/**
 * 6. PAY_NOW_CLICK: User clicks the final "Pay now" button in checkout
 * (Note: Never triggers purchase on its own!)
 */
export function trackPayNowClick(
  product: ProductConfig,
  quantity: number,
  transactionId?: string
): void {
  if (typeof window === 'undefined') return;

  const totalPrice = Number((product.price * quantity).toFixed(2));

  pushToDataLayer({
    event: 'pay_now_click',
    product_id: product.id,
    quantity: quantity,
    value: totalPrice,
    currency: TRACKING_CONFIG.CURRENCY,
    transaction_id: transactionId,
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', 'PayNowClick', {
        product_id: product.id,
        value: totalPrice,
        currency: TRACKING_CONFIG.CURRENCY,
        transaction_id: transactionId,
      });
    } catch (_) {}
  }
}

/**
 * 7. PURCHASE: PAYMENT EFFECTIVELY CONFIRMED ONLY.
 * 
 * STRICT COMPLIANCE RULE:
 * This event MUST NEVER be triggered merely by clicking "Pay now".
 * It requires confirmed payment verification from an authorized source
 * (e.g. order confirmation return from Pagou.ai with valid transaction ID,
 * or verified payment webhook confirmation).
 */
export function trackPurchase(order: PurchaseOrder): boolean {
  if (typeof window === 'undefined') return false;

  if (!order || !order.transactionId) {
    console.warn('[Kavere Tracking] Purchase event rejected: Missing transactionId.');
    return false;
  }

  if (!order.verificationSource) {
    console.warn(
      '[Kavere Tracking] Purchase event rejected: Verification source missing. Purchase cannot fire from unconfirmed clicks.'
    );
    return false;
  }

  // Strictly prevent duplicate purchase tracking across reloads / multiple tabs
  const storageKey = `kavere_purchase_processed_${order.transactionId}`;
  try {
    if (sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)) {
      console.info(`[Kavere Tracking] Purchase ${order.transactionId} was already tracked. Deduplicated.`);
      return false;
    }
    sessionStorage.setItem(storageKey, 'true');
    localStorage.setItem(storageKey, 'true');
  } catch (_) {}

  const totalPrice = order.totalPrice || Number((order.product.price * order.quantity).toFixed(2));
  const vehicleString = order.vehicleInfo && order.vehicleInfo.make
    ? `${order.vehicleInfo.make} ${order.vehicleInfo.model || ''} (${order.vehicleInfo.year || ''})`.trim()
    : undefined;

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.transactionId,
      value: totalPrice,
      currency: TRACKING_CONFIG.CURRENCY,
      tax: 0,
      shipping: 0,
      market: TRACKING_CONFIG.MARKET,
      items: [
        {
          item_id: order.product.id,
          item_name: order.product.name,
          price: order.product.price,
          currency: TRACKING_CONFIG.CURRENCY,
          item_category: order.product.category,
          quantity: order.quantity,
          item_brand: 'Kavere Car',
          vehicle_selection: vehicleString,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: [order.product.id],
          content_name: order.product.name,
          content_type: 'product',
          value: totalPrice,
          currency: TRACKING_CONFIG.CURRENCY,
          num_items: order.quantity,
        },
        { eventID: `pur_${order.transactionId}` }
      );
    } catch (_) {}
  }

  return true;
}

/**
 * 8. PAYMENT_FAILED: Payment attempted but failed, declined, or canceled.
 */
export function trackPaymentFailed(info: PaymentFailedInfo): void {
  if (typeof window === 'undefined') return;

  const product = info.product || TRACKING_CONFIG.PRODUCTS.product_4990;
  const quantity = info.quantity || 1;
  const totalPrice = info.totalPrice || Number((product.price * quantity).toFixed(2));

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'payment_failed',
    ecommerce: {
      transaction_id: info.transactionId,
      value: totalPrice,
      currency: TRACKING_CONFIG.CURRENCY,
      error_code: info.errorCode || 'declined',
      error_message: info.errorMessage || 'Payment was declined or failed',
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          currency: TRACKING_CONFIG.CURRENCY,
          item_category: product.category,
          quantity: quantity,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', 'PaymentFailed', {
        transaction_id: info.transactionId,
        error_code: info.errorCode,
        value: totalPrice,
        currency: TRACKING_CONFIG.CURRENCY,
      });
    } catch (_) {}
  }
}

/**
 * Updates consent preferences for Google Consent Mode v2 and Microsoft Clarity.
 */
export function updateConsentState(consents: { analytics: boolean; marketing: boolean }): void {
  if (typeof window === 'undefined') return;

  const storageSettings = {
    ad_storage: consents.marketing ? 'granted' : 'denied',
    ad_user_data: consents.marketing ? 'granted' : 'denied',
    ad_personalization: consents.marketing ? 'granted' : 'denied',
    analytics_storage: consents.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: consents.marketing ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  // Google Consent Mode v2 update
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('consent', 'update', storageSettings);
    } catch (_) {}
  }

  // Push consent update to GTM dataLayer
  pushToDataLayer({
    event: 'consent_update',
    consent_status: consents,
  });

  // Microsoft Clarity consent
  if (consents.analytics && typeof window.clarity === 'function') {
    try {
      window.clarity('consent');
    } catch (_) {}
  }

  // Persist preference in localStorage
  try {
    localStorage.setItem(
      'kavere_cookie_consent',
      JSON.stringify({
        ...consents,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (_) {}
}

// Expose universal tracking API on window for GTM, external checkout integrations, and testing
if (typeof window !== 'undefined') {
  (window as any).__kavereTracking = {
    trackPageView,
    trackViewItem,
    trackCheckoutClick,
    trackBeginCheckout,
    trackAddPaymentInfo,
    trackPayNowClick,
    trackPurchase,
    trackPaymentFailed,
    generateTransactionId,
    getAttributionData,
    updateConsentState,
    config: TRACKING_CONFIG,
  };
}
