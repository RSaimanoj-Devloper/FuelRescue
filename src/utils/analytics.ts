// Analytics helper for Google Analytics (gtag.js)

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else {
      console.log(`[Analytics Event: ${eventName}]`, params);
    }
  } catch (e) {
    // Silent fail
  }
};
