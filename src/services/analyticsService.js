import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

export const analyticsService = {
  track: (eventName, params = {}) => {
    if (analytics) logEvent(analytics, eventName, params);
  },

  trackViewProduct: (product) =>
    analyticsService.track('view_product', {
      product: product.name,
      category: product.category,
    }),

  trackPurchaseIntent: (product, quantity, toppings) =>
    analyticsService.track('purchase_intent', {
      product: product.name,
      quantity,
      toppings,
    }),

  trackPageView: (pageName) =>
    analyticsService.track('page_view', { page: pageName }),
};
