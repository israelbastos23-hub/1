/**
 * Centralized Tracking & Analytics Configuration for KAVERECAR.COM
 * 
 * Powered by Google Tag Manager (GTM-MVGHRNMN) as the single tag loader.
 */

export interface ProductConfig {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  checkoutId: string;
  checkoutUrl: string;
}

export const TRACKING_CONFIG = {
  // Official Tracking Identifiers
  GTM_CONTAINER_ID: import.meta.env.VITE_GTM_CONTAINER_ID || 'GTM-MVGHRNMN',
  GA4_MEASUREMENT_ID: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-WSS9S01PJK',
  CLARITY_PROJECT_ID: import.meta.env.VITE_CLARITY_PROJECT_ID || 'z5lvnhw0fw',
  META_PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID || '1172958688595387',

  // Market & Currency Standards
  CURRENCY: 'GBP',
  MARKET: 'United Kingdom',
  COUNTRY_CODE: 'GB',

  // Official Product Configurations & Checkouts
  PRODUCTS: {
    // Produto 1: Interior Mats + Free Wipers
    product_3990: {
      id: 'product_3990',
      name: 'Interior Mats + Free Wipers',
      price: 39.90,
      currency: 'GBP',
      category: 'Car Floor Mats',
      checkoutId: 'chk_01M646VDQEQT08JV8RH6BTQ2N6',
      checkoutUrl: 'https://checkout.pagou.ai/checkout/chk_01M646VDQEQT08JV8RH6BTQ2N6',
    } as ProductConfig,

    // Produto 2: Interior Mats + Boot Mat + Free Wipers
    product_4990: {
      id: 'product_4990',
      name: 'Interior Mats + Boot Mat + Free Wipers',
      price: 49.90,
      currency: 'GBP',
      category: 'Car Floor Mats',
      checkoutId: 'chk_01M646VXSK2WMEQFR1034R09ZZ',
      checkoutUrl: 'https://checkout.pagou.ai/checkout/chk_01M646VXSK2WMEQFR1034R09ZZ',
    } as ProductConfig,
  },

  EXTERNAL_CHECKOUT_DOMAIN: 'checkout.pagou.ai',
};
