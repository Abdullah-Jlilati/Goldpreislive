/**
 * Gold API Integration Module
 * Single-source of truth using live free market data
 * Source: data-asg.goldprice.org (Free Public Endpoint)
 * STRICTLY LINKED TO LIVE API
 */

const GoldAPI = {
  // Free Public API Endpoint
  API_URL_EUR: "https://data-asg.goldprice.org/dbXRates/EUR",
  API_URL_USD: "https://data-asg.goldprice.org/dbXRates/USD",
  CURRENCY_API: "https://open.er-api.com/v6/latest/USD", // Free Currency API
  
  // Conversions
  OZ_TO_GRAM: 31.1034768,
  
  // Karat purity multipliers
  KARAT_PURITY: {
    "24k": 1.0,
    "22k": 0.9167,
    "21k": 0.875,
    "18k": 0.750,
    "14k": 0.585,
  },

  // Cache for prices
  cache: {
    gold: null,
    silver: null,
    lastUpdate: null,
    eurUsd: 1.08, // Default fallback
    rates: null, // Exchange rates cache
  },

  /**
   * Main Fetch Function
   * Strictly fetches from the free API
   */
  async fetchAllPrices() {
    console.log('🚀 Fetching live prices from GoldPrice Free API...');
    
    try {
      // Parallel Fetch: Gold Prices AND Currency Rates
      const [priceData] = await Promise.all([
        this.fetchGoldPrices(),
        this.fetchCurrencyRates()
      ]);

      return { 
        gold: this.cache.gold, 
        silver: this.cache.silver, 
        lastUpdate: this.cache.lastUpdate,
        rates: this.cache.rates 
      };

    } catch (error) {
      console.error("Critical API Error:", error);
      // Fallback: return cached even if null
      return { 
          gold: this.cache.gold, 
          silver: this.cache.silver, 
          rates: this.cache.rates 
      };
    }
  },

  async fetchCurrencyRates() {
      try {
          const response = await fetch(this.CURRENCY_API);
          if (response.ok) {
              const data = await response.json();
              this.cache.rates = data.rates;
              console.log("💱 Currency rates updated");
          }
      } catch (e) {
          console.warn("Failed to fetch currency rates", e);
      }
  },

  async fetchGoldPrices() {
      console.log('🌐 Fetching EUR prices from API...');
      
      // 1. Fetch EUR data directly
      const responseEur = await fetch(this.API_URL_EUR, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!responseEur.ok) {
          console.error('❌ EUR API failed:', responseEur.status);
          throw new Error(`API Error: ${responseEur.status}`);
      }

      const dataEur = await responseEur.json();
      console.log('📥 EUR API Response:', dataEur);
      
      if (!dataEur.items || !dataEur.items[0]) throw new Error('Invalid Data Structure from API');

      const itemEur = dataEur.items[0];
      const goldEurOz = itemEur.xauPrice;
      const silverEurOz = itemEur.xagPrice;
      
      console.log('🥇 Gold (oz):', goldEurOz, '€/oz');
      console.log('🥈 Silver (oz):', silverEurOz, '€/oz');
      
      if (!goldEurOz || !silverEurOz) throw new Error('Missing price data in API response');

      // 2. Fetch USD data (Optional, for EUR/USD calculation)
      let goldUsdOz = 0;
      let silverUsdOz = 0;
      let eurUsdRate = this.cache.eurUsd;
      
      try {
        console.log('🌐 Fetching USD prices...');
        const responseUsd = await fetch(this.API_URL_USD);
        if (responseUsd.ok) {
            const dataUsd = await responseUsd.json();
            if (dataUsd.items && dataUsd.items[0]) {
                goldUsdOz = dataUsd.items[0].xauPrice;
                silverUsdOz = dataUsd.items[0].xagPrice;
                
                // Calculate Implied Exchange Rate: 1 EUR = X USD
                if (goldEurOz > 0) {
                    eurUsdRate = goldUsdOz / goldEurOz; 
                    this.cache.eurUsd = eurUsdRate; // Update cache
                    console.log('💱 EUR/USD Rate:', eurUsdRate.toFixed(4));
                }
            }
        }
      } catch (e) {
        console.warn('⚠️ USD Fetch failed, using EUR only:', e.message);
      }

      // 3. Convert to Grams
      const goldEurGram = goldEurOz / this.OZ_TO_GRAM;
      const silverEurGram = silverEurOz / this.OZ_TO_GRAM;
      
      console.log('✨ Converted to grams:');
      console.log('  Gold:', goldEurGram.toFixed(2), '€/g');
      console.log('  Silver:', silverEurGram.toFixed(2), '€/g');
      
      // Update Cache
      const now = new Date();
      this.cache.gold = { 
          price_gram_24k: goldEurGram, 
          price_gram_24k_usd: goldUsdOz ? (goldUsdOz / this.OZ_TO_GRAM) : (goldEurGram * eurUsdRate)
      };
      this.cache.silver = { 
          price_gram_24k: silverEurGram,
          price_gram_24k_usd: silverUsdOz ? (silverUsdOz / this.OZ_TO_GRAM) : (silverEurGram * eurUsdRate)
      };
      this.cache.lastUpdate = now;
      
      console.log('✅ Prices cached successfully');
      
      return true;
  },
      


  // Helper Methods
  getEurUsdRate() {
      return this.cache.eurUsd || 1.08;
  },

  async fetchGoldPrice() {
    const data = await this.fetchAllPrices();
    return data ? data.gold : null;
  },

  async fetchSilverPrice() {
    const data = await this.fetchAllPrices();
    return data ? data.silver : null;
  },
  
  async fetchPrice(metal) {
     const data = await this.fetchAllPrices();
     if (!data) return null;
     return metal === 'XAU' ? data.gold : data.silver;
  },

  getKaratPrice(karat, pricePerGram24k) {
    return pricePerGram24k * (this.KARAT_PURITY[karat] || 1);
  },

  getAllKaratPrices(pricePerGram24k) {
    const prices = {};
    const eurUsd = this.cache.eurUsd;
    for (const [karat, purity] of Object.entries(this.KARAT_PURITY)) {
      const priceEur = pricePerGram24k * purity;
      prices[karat] = {
        eur: priceEur.toFixed(2),
        usd: (priceEur * eurUsd).toFixed(2)
      };
    }
    return prices;
  },
  
  formatPrice(price, currency = "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  },

  getWeightPrices(pricePerGram, currency = 'EUR') {
    const weights = {
      '1oz': 31.1035,
      '10g': 10,
      '20g': 20,
      '50g': 50,
      '100g': 100
    };
    const result = {};
    for (const [label, grams] of Object.entries(weights)) {
      result[label] = {
        grams: grams,
        price: (pricePerGram * grams).toFixed(2),
        currency: currency
      };
    }
    return result;
  }
};

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = GoldAPI;
}
