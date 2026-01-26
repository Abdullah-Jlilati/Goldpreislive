/**
 * Internationalization (i18n) Module
 * Handles language detection, switching, and translations
 */

const I18n = {
  currentLang: 'de',
  translations: {},
  supportedLangs: ['de', 'ar', 'en'],
  
  /**
   * Initialize i18n system
   */
  async init() {
    // Detect language from URL, localStorage, or browser
    this.currentLang = this.detectLanguage();
    
    // Load translations
    await this.loadTranslations(this.currentLang);
    
    // Apply translations to page
    this.applyTranslations();
    
    // Set document direction for RTL languages
    this.setDirection();
    
    // Update language switcher UI
    this.updateLangSwitcher();
    
    return this.currentLang;
  },
  
  /**
   * Detect user's preferred language
   */
  detectLanguage() {
    // Check URL path
    const path = window.location.pathname;
    if (path.startsWith('/ar/') || path.includes('/ar/')) return 'ar';
    if (path.startsWith('/de/') || path.includes('/de/')) return 'de';
    if (path.startsWith('/en/') || path.includes('/en/')) return 'en';
    
    // Check localStorage
    const savedLang = localStorage.getItem('goldpreis-lang');
    if (savedLang && this.supportedLangs.includes(savedLang)) {
      return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ar') return 'ar';
    
    // Default to German
    return 'de';
  },
  
   /**
   * Load translation file
   */
  async loadTranslations(lang) {
    // Try to use embedded translations first (for file:// support)
    if (typeof Translations !== 'undefined' && Translations[lang]) {
      this.translations = Translations[lang];
      return;
    }

    try {
      const response = await fetch(`../lang/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load translations');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback strategies...
      try {
        const response = await fetch(`/lang/${lang}.json`);
        this.translations = await response.json();
      } catch (e) {
          console.error("All translation loading attempts failed.");
      }
    }
  },
  
  /**
   * Get translation by key path (e.g., 'nav.home')
   */
  t(keyPath, fallback = '') {
    const keys = keyPath.split('.');
    let value = this.translations;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback || keyPath;
      }
    }
    
    return value || fallback || keyPath;
  },
  
  /**
   * Apply translations to elements with data-i18n attribute
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
    
    // Update page title
    if (this.translations.meta?.title) {
      document.title = this.translations.meta.title;
    }
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && this.translations.meta?.description) {
      metaDesc.content = this.translations.meta.description;
    }
  },
  
  /**
   * Set document direction (LTR/RTL)
   */
  setDirection() {
    const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', this.currentLang);
  },
  
  /**
   * Switch language
   */
  async switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) return;
    
    this.currentLang = lang;
    localStorage.setItem('goldpreis-lang', lang);
    
    await this.loadTranslations(lang);
    this.applyTranslations();
    this.setDirection();
    this.updateLangSwitcher();
    
    // Redirect to language-specific URL
    this.redirectToLangUrl(lang);
  },
  
  /**
   * Update language switcher buttons
   */
  updateLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === this.currentLang);
    });
  },
  
  /**
   * Redirect to language-specific URL
   */
  redirectToLangUrl(targetLang) {
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    const nameNoExt = decodeURIComponent(filename).replace('.html', '');
    
    // Mapping definitions
    // Key: German filename (no ext)
    // Value: { ar: 'Arabic', en: 'English' }
    const urlMap = {
        'index': { ar: 'index', en: 'index' },
        'goldpreis': { ar: 'gold-price', en: 'gold-price' },
        'gold-price': { ar: 'gold-price', en: 'gold-price' },
        'silberpreis': { ar: 'silver-price', en: 'silver-price' },
        'silver-price': { ar: 'silver-price', en: 'silver-price' },
        'rechner': { ar: 'calculator', en: 'calculator' },
        'calculator': { ar: 'calculator', en: 'calculator' },
        'nachrichten': { ar: 'news', en: 'news' },
        'news': { ar: 'news', en: 'news' },
        'blog': { ar: 'blog', en: 'blog' },
        'ueber-uns': { ar: 'about', en: 'about' },
        'about': { ar: 'about', en: 'about' },
        'kontakt': { ar: 'contact', en: 'contact' },
        'contact': { ar: 'contact', en: 'contact' },
        'datenschutz': { ar: 'privacy', en: 'privacy' },
        'privacy': { ar: 'privacy', en: 'privacy' },
        'agb': { ar: 'terms', en: 'terms' },
        'terms': { ar: 'terms', en: 'terms' }
    };
    
    // Find base filename in any language
    let baseFile = 'index';
    for (const [key, values] of Object.entries(urlMap)) {
        if (nameNoExt === key || Object.values(values).includes(nameNoExt)) {
            baseFile = key;
            break;
        }
    }
    
    const targetFilename = (urlMap[baseFile][targetLang] || baseFile) + '.html';
    
    // Construct new path
    let newPath = '';
    
    // Determine target folder
    const targetFolder = `/${targetLang}/`;
    
    if (currentPath.includes('/de/')) {
        newPath = currentPath.replace('/de/', targetFolder);
    } else if (currentPath.includes('/ar/')) {
        newPath = currentPath.replace('/ar/', targetFolder);
    } else if (currentPath.includes('/en/')) {
        newPath = currentPath.replace('/en/', targetFolder);
    } else {
        newPath = `../${targetLang}/${targetFilename}`;
    }
    
    // Apply filename change
    newPath = newPath.substring(0, newPath.lastIndexOf('/') + 1) + targetFilename;

    if (currentPath !== newPath) {
        window.location.href = newPath;
    }
  },
  
  /**
   * Get current language
   */
  getCurrentLang() {
    return this.currentLang;
  },
  
  /**
   * Check if current language is RTL
   */
  isRTL() {
    return this.currentLang === 'ar';
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
