/**
 * Main Application Module
 * Orchestrates all components
 */

const App = {
  refreshInterval: null,
  REFRESH_RATE: 60000, // 60 seconds

  /**
   * Initialize application
   */
  async init() {
    console.log("Goldpreis Live - Initializing...");

    // Initialize theme
    this.initTheme();

    // Initialize cookie consent
    if (typeof CookieConsent !== "undefined") {
      CookieConsent.init();
    }

    // Initialize i18n
    if (typeof I18n !== "undefined") {
      await I18n.init();
    }

    // Fetch initial prices
    await this.fetchPrices();

    // Initialize charts
    if (typeof Charts !== "undefined") {
      Charts.init();
    }

    // Initialize calculator
    if (typeof Calculator !== "undefined") {
      Calculator.init();
    }

    // Start auto-refresh
    this.startAutoRefresh();

    // Bind events
    this.bindEvents();
    
    // Inject Mobile Nav for all pages
    this.injectMobileNav();
    
    // Inject Mobile Menu (Hamburger) & Drawer
    this.injectMobileMenu();

    console.log("Goldpreis Live - Ready!");
  },
  
  /**
   * Inject Mobile Bottom Navigation Global
   */
  injectMobileNav() {
    // If nav already exists (e.g. hardcoded in HTML), don't duplicate
    if (document.querySelector('.mobile-quick-nav')) return;

    const lang = document.documentElement.lang || 'de';
    
    // Translations
    const navText = {
        de: { home: 'Startseite', gold: 'Gold', silver: 'Silber', calc: 'Rechner' },
        ar: { home: 'الرئيسية', gold: 'ذهب', silver: 'فضة', calc: 'الحاسبة' },
        en: { home: 'Home', gold: 'Gold', silver: 'Silver', calc: 'Calc' }
    }[lang] || { home: 'Home', gold: 'Gold', silver: 'Silver', calc: 'Calc' };

    // Links mapping - files are standardized to English names across all folders
    const links = { 
        home: 'index.html', 
        gold: 'gold-price.html', 
        silver: 'silver-price.html', 
        calc: 'calculator.html' 
    };

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const isHome = currentFile === 'index.html' || currentFile === '';
    
    // Check actives
    const isActive = (page) => {
        if (page === 'index.html' && isHome) return 'active';
        return currentFile.includes(page.replace('.html', '')) ? 'active' : '';
    };

    const navHTML = `
      <nav class="mobile-quick-nav">
        <div class="quick-nav-grid">
            <a href="${links.home}" class="quick-nav-btn ${isActive(links.home)}">
                <span class="quick-nav-icon">🏠</span>
                <span>${navText.home}</span>
            </a>
            <a href="${links.gold}" class="quick-nav-btn ${isActive(links.gold)}">
                <span class="quick-nav-icon">🥇</span>
                <span>${navText.gold}</span>
            </a>
            <a href="${links.silver}" class="quick-nav-btn ${isActive(links.silver)}">
                <span class="quick-nav-icon">🥈</span>
                <span>${navText.silver}</span>
            </a>
            <a href="${links.calc}" class="quick-nav-btn ${isActive(links.calc)}">
                <span class="quick-nav-icon">🔢</span>
                <span>${navText.calc}</span>
            </a>
        </div>
      </nav>
    `;
    
    document.body.insertAdjacentHTML('beforeend', navHTML);
  },

  /**
   * Inject Mobile Menu Button (Hamburger) & Side Drawer
   */
  injectMobileMenu() {
    // 0. CLEANUP: Remove hardcoded/incomplete elements from HTML files
    const existingNav = document.getElementById('mobileNav');
    if (existingNav) existingNav.remove();
    
    const existingOverlay = document.getElementById('mobileOverlay');
    if (existingOverlay) existingOverlay.remove();

    const existingBtn = document.getElementById('mobileMenuBtn');
    if (existingBtn) existingBtn.remove(); // Remove old SVG buttons

    // 1. Inject Menu Button (New CSS Hamburger)
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        const btnHTML = `
            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        `;
        headerActions.insertAdjacentHTML('beforeend', btnHTML);
        console.log('🍔 Mobile Menu Button Injected');
    }

    // 2. Inject Mobile Nav Drawer
    const lang = document.documentElement.lang || 'de';
    
    // Translations
    const text = {
        de: { gold: 'Goldpreis', silver: 'Silberpreis', calc: 'Rechner', news: 'Nachrichten', blog: 'Blog', about: 'Über uns', contact: 'Kontakt' },
        ar: { gold: 'سعر الذهب', silver: 'سعر الفضة', calc: 'الحاسبة', news: 'الأخبار', blog: 'المدونة', about: 'من نحن', contact: 'اتصل بنا' },
        en: { gold: 'Gold Price', silver: 'Silver Price', calc: 'Calculator', news: 'News', blog: 'Blog', about: 'About', contact: 'Contact' }
    }[lang] || { gold: 'Gold', silver: 'Silver', calc: 'Calculator' };

    // Links (Standard English Names)
    const links = {
        gold: 'gold-price.html',
        silver: 'silver-price.html',
        calc: 'calculator.html',
        news: 'news.html',
        blog: 'blog.html',
        about: 'about.html',
        contact: 'contact.html'
    };

    const navHTML = `
        <div class="mobile-overlay" id="mobileOverlay"></div>
        <nav class="mobile-nav" id="mobileNav">
            <div class="mobile-nav-links">
                <a href="index.html" class="mobile-nav-link">🏠 ${lang === 'ar' ? 'الرئيسية' : (lang === 'de' ? 'Startseite' : 'Home')}</a>
                <a href="${links.gold}" class="mobile-nav-link">${text.gold}</a>
                <a href="${links.silver}" class="mobile-nav-link">${text.silver}</a>
                <a href="${links.calc}" class="mobile-nav-link">${text.calc}</a>
                <hr style="border-color: var(--border-color); width: 100%; margin: 5px 0;">
                <a href="${links.news}" class="mobile-nav-link">${text.news}</a>
                <a href="${links.blog}" class="mobile-nav-link">${text.blog}</a>
                <a href="${links.about}" class="mobile-nav-link">${text.about}</a>
                <a href="${links.contact}" class="mobile-nav-link">${text.contact}</a>
            </div>
        </nav>
    `;
    document.body.insertAdjacentHTML('beforeend', navHTML);
    console.log('📂 Mobile Drawer Injected');
    
    // 3. Re-bind Events (Toggle Logic)
    this.bindMobileMenuEvents();
  },

  bindMobileMenuEvents() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');

    if (btn && nav) {
        // Remove old listeners to avoid duplicates (clone node hack)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        const toggleMenu = (e) => {
             e.preventDefault();
             e.stopPropagation();
             const isOpen = nav.classList.contains('open');
             if(isOpen) {
                 nav.classList.remove('open');
                 if(overlay) overlay.classList.remove('visible');
                 newBtn.setAttribute('aria-expanded', 'false');
             } else {
                 nav.classList.add('open');
                 if(overlay) overlay.classList.add('visible');
                 newBtn.setAttribute('aria-expanded', 'true');
             }
        };

        newBtn.addEventListener('click', toggleMenu);
        
        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                nav.classList.remove('open');
                overlay.classList.remove('visible');
                newBtn.setAttribute('aria-expanded', 'false');
            });
        }
    }
  },

  /**
   * Initialize theme from localStorage or default to dark mode
   */
  initTheme() {
    const savedTheme = localStorage.getItem("goldpreis-theme");
    // Default to dark mode if no saved preference
    const theme = savedTheme || "dark";

    document.documentElement.setAttribute("data-theme", theme);
    this.updateThemeIcon(theme);
  },

  /**
   * Toggle theme
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("goldpreis-theme", newTheme);
    this.updateThemeIcon(newTheme);

    // Update charts for new theme
    if (typeof Charts !== "undefined") {
      Charts.updateTheme(newTheme === "dark");
    }
  },

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    const sunIcon = document.getElementById("sunIcon");
    const moonIcon = document.getElementById("moonIcon");

    if (sunIcon && moonIcon) {
      sunIcon.style.display = theme === "dark" ? "block" : "none";
      moonIcon.style.display = theme === "dark" ? "none" : "block";
    }
  },

  /**
   * Fetch and display prices
   */
  async fetchPrices() {
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.classList.add("loading");
    }

    console.log("📡 App: Fetching prices...");

    try {
      if (typeof GoldAPI !== "undefined") {
        const prices = await GoldAPI.fetchAllPrices();

        console.log("📦 App: Received prices:", {
          gold: prices?.gold?.price_gram_24k,
          silver: prices?.silver?.price_gram_24k,
          eurUsd: GoldAPI.getEurUsdRate(),
          hasRates: !!prices?.rates,
        });

        this.updatePriceDisplay(prices);

        // ALWAYS update calculator, even if gold/silver are null
        if (typeof Calculator !== "undefined") {
          const goldPrice = prices?.gold?.price_gram_24k || 0;
          const silverPrice = prices?.silver?.price_gram_24k || 0;
          const eurUsd = GoldAPI.getEurUsdRate() || 1.08;
          const rates = prices?.rates || null;

          console.log("🔄 App: Updating Calculator with:", {
            goldPrice,
            silverPrice,
            eurUsd,
            hasRates: !!rates,
          });

          Calculator.updateRates(goldPrice, silverPrice, eurUsd, rates);
        } else {
          console.warn("⚠️ Calculator is not defined!");
        }
      } else {
        console.error("❌ GoldAPI is not defined!");
      }
    } catch (error) {
      console.error("❌ Error fetching prices:", error);
      console.error("Stack:", error.stack);
    } finally {
      if (refreshBtn) {
        refreshBtn.classList.remove("loading");
      }
    }
  },

  /**
   * Update price display elements
   */
  updatePriceDisplay(prices) {
    // Update gold price
    if (prices.gold) {
      const goldPriceEl = document.getElementById("goldPrice");
      const goldUsdEl = document.getElementById("goldPriceUsd");
      const goldChangeEl = document.getElementById("goldChange");

      if (goldPriceEl) {
        goldPriceEl.textContent = GoldAPI.formatPrice(
          prices.gold.price_gram_24k,
        );
      }
      if (goldUsdEl) {
        goldUsdEl.textContent = `${prices.gold.price_gram_24k_usd?.toFixed(2) || "0.00"} $`;
      }
      if (goldChangeEl) {
        const change = prices.gold.chp || 0;
        goldChangeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
        goldChangeEl.className = `price-change ${change >= 0 ? "up" : "down"}`;
      }

      // Update karat prices
      const karatPrices = GoldAPI.getAllKaratPrices(prices.gold.price_gram_24k);
      for (const [karat, price] of Object.entries(karatPrices)) {
        // Main Grid/Card Elements
        const karatEl = document.getElementById(`${karat}Price`);
        const karatUsdEl = document.getElementById(`${karat}PriceUsd`);
        if (karatEl) karatEl.textContent = `${price.eur} €`;
        if (karatUsdEl) karatUsdEl.textContent = `${price.usd} $`;

        // Table Elements (Suffix 'Table')
        const karatTableEl = document.getElementById(`${karat}PriceTable`);
        const karatTableUsdEl = document.getElementById(
          `${karat}PriceTableUsd`,
        );
        if (karatTableEl) karatTableEl.textContent = `${price.eur} €`;
        if (karatTableUsdEl) karatTableUsdEl.textContent = `${price.usd} $`;
      }

      // Update Gold Weights (10g, 20g, 50g, 100g, Oz)
      const goldWeights = {
        gold10g: 10,
        gold20g: 20,
        gold50g: 50,
        gold100g: 100,
        goldOz: 31.1035,
      };

      const pricePerGramGold = prices.gold.price_gram_24k;
      const pricePerGramGoldUsd =
        prices.gold.price_gram_24k_usd ||
        pricePerGramGold * GoldAPI.getEurUsdRate();

      for (const [idBase, multiplier] of Object.entries(goldWeights)) {
        const elEur = document.getElementById(`${idBase}Price`);
        const elUsd = document.getElementById(`${idBase}PriceUsd`);

        if (elEur) {
          elEur.textContent = GoldAPI.formatPrice(
            pricePerGramGold * multiplier,
          );
        }
        if (elUsd) {
          elUsd.textContent = `${(pricePerGramGoldUsd * multiplier).toFixed(2)} $`;
        }
      }
    }

    // Update silver price
    if (prices.silver) {
      const silverPriceEl = document.getElementById("silverPrice");
      const silverUsdEl = document.getElementById("silverPriceUsd");
      const silverChangeEl = document.getElementById("silverChange");

      const pricePerGram = prices.silver.price_gram_24k;
      const pricePerGramUsd =
        prices.silver.price_gram_24k_usd ||
        pricePerGram * GoldAPI.getEurUsdRate();

      if (silverPriceEl) {
        silverPriceEl.textContent = GoldAPI.formatPrice(pricePerGram);
      }
      if (silverUsdEl) {
        silverUsdEl.textContent = `${pricePerGramUsd?.toFixed(2) || "0.00"} $`;
      }
      if (silverChangeEl) {
        const change = prices.silver.chp || 0;
        silverChangeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
        silverChangeEl.className = `price-change ${change >= 0 ? "up" : "down"}`;
      }

      // Update custom silver "karat/weight" prices if elements exist
      const silverWeights = {
        silverOz: 31.1035, // Troy Ounce
        silverKg: 1000,
        silver925: 0.925, // Sterling per gram
        silver800: 0.8, // 800 silver per gram
        silver10g: 10,
        silver20g: 20,
        silver50g: 50,
        silver100g: 100,
      };

      for (const [idBase, multiplier] of Object.entries(silverWeights)) {
        const elEur = document.getElementById(`${idBase}Price`);
        const elUsd = document.getElementById(`${idBase}PriceUsd`);
        // Table variants
        const tableEur = document.getElementById(`${idBase}PriceTable`);
        const tableUsd = document.getElementById(`${idBase}PriceTableUsd`);

        const valEur = GoldAPI.formatPrice(pricePerGram * multiplier);
        const valUsd = `${(pricePerGramUsd * multiplier).toFixed(2)} $`;

        if (elEur) elEur.textContent = valEur;
        if (elUsd) elUsd.textContent = valUsd;
        if (tableEur) tableEur.textContent = valEur;
        if (tableUsd) tableUsd.textContent = valUsd;
      }
    }

    // Refresh history tables with new data (only if Charts module exists)
    if (typeof Charts !== "undefined" && Charts && Charts.init) {
      Charts.init();
    }

    // Update last update time
    const updateTimeEl = document.getElementById("lastUpdate");
    if (updateTimeEl) {
      const now = new Date(); // Always use current time
      const lang = document.documentElement.lang || "de";
      const locale =
        lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "de-DE";
      updateTimeEl.textContent = now.toLocaleTimeString(locale);
    }
  },

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.fetchPrices();
    }, this.REFRESH_RATE);
  },

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.fetchPrices());
    }

    // Language switcher
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lang = e.target.getAttribute("data-lang");
        if (typeof I18n !== "undefined") {
          I18n.switchLanguage(lang);
        }
      });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNav");

    if (mobileMenuBtn && mobileNav) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
        mobileMenuBtn.setAttribute(
          "aria-expanded",
          mobileNav.classList.contains("open"),
        );
      });
    }

    // Close mobile menu on link click
    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileNav) mobileNav.classList.remove("open");
      });
    });
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = App;
}
