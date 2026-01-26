/**
 * Cookie Consent Module
 * GDPR-compliant cookie consent banner
 */

const CookieConsent = {
  STORAGE_KEY: 'goldpreis-cookie-consent',
  
  /**
   * Initialize cookie consent
   */
  init() {
    const consent = this.getConsent();
    
    if (!consent) {
      this.showBanner();
    } else {
      this.applyConsent(consent);
    }
    
    this.bindEvents();
  },
  
  /**
   * Get stored consent
   */
  getConsent() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  
  /**
   * Save consent
   */
  saveConsent(consent) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...consent,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Error saving consent:', e);
    }
  },
  
  /**
   * Show cookie banner
   */
  showBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      setTimeout(() => {
        banner.classList.add('show');
      }, 1000);
    }
  },
  
  /**
   * Hide cookie banner
   */
  hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  },
  
  /**
   * Apply consent settings
   */
  applyConsent(consent) {
    if (consent.analytics) {
      this.enableAnalytics();
    }
    
    if (consent.advertising) {
      this.enableAdvertising();
    }
  },
  
  /**
   * Accept all cookies
   */
  acceptAll() {
    const consent = {
      necessary: true,
      analytics: true,
      advertising: true
    };
    
    this.saveConsent(consent);
    this.applyConsent(consent);
    this.hideBanner();
  },
  
  /**
   * Accept only necessary cookies
   */
  acceptNecessary() {
    const consent = {
      necessary: true,
      analytics: false,
      advertising: false
    };
    
    this.saveConsent(consent);
    this.hideBanner();
  },
  
  /**
   * Enable analytics (Google Analytics placeholder)
   */
  enableAnalytics() {
    // Google Analytics would be loaded here
    console.log('Analytics enabled');
  },
  
  /**
   * Enable advertising (Google AdSense)
   */
  enableAdvertising() {
    // Google AdSense initialization
    console.log('Advertising enabled');
    
    // Load AdSense script
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Accept all button
    const acceptAllBtn = document.getElementById('acceptAllCookies');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => this.acceptAll());
    }
    
    // Accept necessary button
    const acceptNecessaryBtn = document.getElementById('acceptNecessaryCookies');
    if (acceptNecessaryBtn) {
      acceptNecessaryBtn.addEventListener('click', () => this.acceptNecessary());
    }
    
    // Settings button (for future implementation)
    const settingsBtn = document.getElementById('cookieSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }
  },
  
  /**
   * Open cookie settings modal
   */
  openSettings() {
    // Could open a modal for granular cookie settings
    console.log('Cookie settings modal would open here');
  },
  
  /**
   * Reset consent (for testing)
   */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.showBanner();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieConsent;
}
