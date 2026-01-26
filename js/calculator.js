/**
 * Calculator Module - Ultimate Edition
 * Features: Gold Calc, Silver Calc, Currency Converter
 */

const Calculator = {
    eurUsdRate: 1.08,
    goldPricePerGram: 0,  // Will be updated from API - no default value
    silverPricePerGram: 0, // Will be updated from API - no default value
    // Default Rates (Fallback)
    rates: {
        'USD': 1.0, 'EUR': 0.93, 'SAR': 3.75, 'AED': 3.67, 'KWD': 0.31, 
        'EGP': 48.0, 'QAR': 3.64, 'TRY': 33.0, 'GBP': 0.79, 'CHF': 0.88, 
        'CAD': 1.36, 'AUD': 1.52, 'INR': 83.0, 'SYP': 13000.0
    },

    karatPurity: {
        '24k': 1.0000, '22k': 0.9166, '21k': 0.8750, '18k': 0.7500, '14k': 0.5850,
        '999': 1.0000, '925': 0.9250, '800': 0.8000
    },

    currencies: {
        'USD': { flag: '🇺🇸', name: 'US Dollar ($)' },
        'EUR': { flag: '🇪🇺', name: 'Euro (€)' },
        'SAR': { flag: '🇸🇦', name: 'Saudi Riyal' },
        'AED': { flag: '🇦🇪', name: 'UAE Dirham' },
        'KWD': { flag: '🇰🇼', name: 'Kuwaiti Dinar' },
        'EGP': { flag: '🇪🇬', name: 'Egyptian Pound' },
        'QAR': { flag: '🇶🇦', name: 'Qatari Riyal' },
        'TRY': { flag: '🇹🇷', name: 'Turkish Lira' },
        'GBP': { flag: '🇬🇧', name: 'British Pound' },
        'CHF': { flag: '🇨🇭', name: 'Swiss Franc' },
        'CAD': { flag: '🇨🇦', name: 'Canadian Dollar' },
        'AUD': { flag: '🇦🇺', name: 'Australian Dollar' },
        'INR': { flag: '🇮🇳', name: 'Indian Rupee' },
        'SYP': { flag: '🇸🇾', name: 'Syrian Lira' }
    },

    // State
    activeTab: 'gold',
    goldWeight: null,
    goldKarat: '24k',
    silverWeight: null,
    silverPurity: '999',
    
    // Currency Converter State
    currFrom: 'EUR',
    currTo: 'USD',
    currAmount: null, 
    currencyGoldKarat: '24k',
    
    init() {
        this.render();
        this.bindEvents();
        // Trigger initial calc if default amount exists
        if(this.currAmount) this.calcCurrency();
    },
    
    updateRates(goldPrice, silverPrice, eurUsd, rates) {
        console.log('🔵 Calculator.updateRates called with:', { goldPrice, silverPrice, eurUsd, hasRates: !!rates });
        
        this.goldPricePerGram = goldPrice || this.goldPricePerGram;
        this.silverPricePerGram = silverPrice || this.silverPricePerGram;
        this.eurUsdRate = eurUsd || this.eurUsdRate;
        
        console.log('💰 Calculator: After update - Gold:', this.goldPricePerGram, '€/g, Silver:', this.silverPricePerGram, '€/g');
        
        // 1. Update/Merge external rates
        if (rates && Object.keys(rates).length > 0) {
            this.rates = rates;
            console.log('💱 Calculator: Currency rates updated from API');
        } else if (!this.rates) {
            // First run without API? Use fallbacks.
            // (this.rates is initialized with defaults above so this block might not run, but safe to keep)
        }

        // 2. FORCE Consistency: Sync EUR rate with Gold Price's EUR/USD rate.
        // The Gold Price is in EUR. The app tracks EUR/USD.
        // Calculator converts input -> USD -> Target.
        // Rate['EUR'] must imply: 1 USD = X EUR.  X = 1 / eurUsdRate.
        // Example: 1 EUR = 1.08 USD. 1 USD = 0.9259 EUR.
        if (this.eurUsdRate) {
            this.rates['EUR'] = 1.0 / this.eurUsdRate;
            this.rates['USD'] = 1.0;
        }

        // Re-render to show updated prices
        console.log('🎨 Calculator: Calling render()...');
        this.render();
        console.log('♻️ Calculator: Calling refreshCalculations()...');
        this.refreshCalculations();
        console.log('✅ Calculator: updateRates complete');
    },
    
    render() {
        const app = document.getElementById('calculatorApp');
        if (app) { this.renderUnifiedApp(app); return; }

        const goldWidget = document.getElementById('goldCalcForm');
        if (goldWidget) { this.renderWidget(goldWidget, 'gold'); }

        const silverWidget = document.getElementById('silverCalcForm');
        if (silverWidget) { this.renderWidget(silverWidget, 'silver'); }
    },

    getTranslations() {
        const lang = document.documentElement.lang || 'de';
        return {
            de: {
                tabs: { gold: 'Gold Rechner', silver: 'Silber Rechner', currency: 'Währungsrechner' },
                labels: { weight: 'Gewicht (Gramm)', purity: 'Feinheit / Karat', amount: 'Betrag', result: 'Ergebnis', convert: 'Umrechnen' },
                purities: { '24k': '24K (999)', '22k': '22K (916)', '21k': '21K (875)', '18k': '18K (750)', '14k': '14K (585)', '999': 'Feinsilber 999', '925': 'Sterling 925', '800': 'Silber 800' },
                curr: { from: 'Von', to: 'Nach', goldPower: 'Gold Kaufkraft' }
            },
            ar: {
                tabs: { gold: 'حاسبة الذهب', silver: 'حاسبة الفضة', currency: 'محول العملات' },
                labels: { weight: 'الوزن (جرام)', purity: 'القيراط / النقاء', amount: 'المبلغ', result: 'النتيجة', convert: 'تحويل' },
                purities: { '24k': '24 قيراط', '22k': '22 قيراط', '21k': '21 قيراط', '18k': '18 قيراط', '14k': '14 قيراط', '999': 'فضة نقية 999', '925': 'استرليني 925', '800': 'فضة 800' },
                curr: { from: 'من', to: 'إلى', goldPower: 'قدرة شراء الذهب' }
            },
            en: {
                tabs: { gold: 'Gold Calc', silver: 'Silver Calc', currency: 'Currency Conv' },
                labels: { weight: 'Weight', purity: 'Purity', amount: 'Amount', result: 'Result', convert: 'Convert' },
                purities: { '24k': '24K (999)', '22k': '22K (916)', '21k': '21K (875)', '18k': '18K (750)', '14k': '14K (585)', '999': 'Fine Silver 999', '925': 'Sterling 925', '800': 'Silver 800' },
                curr: { from: 'From', to: 'To', goldPower: 'Gold Purchasing Power' }
            }
        }[lang] || {};
    },

    renderUnifiedApp(container) {
        const t = this.getTranslations();
        const safeT = (path) => path || '';
        
        container.innerHTML = `
            <div class="calc-app-wrapper">
                <div class="calc-tabs">
                    <button class="c-tab ${this.activeTab === 'gold' ? 'active' : ''}" data-tab="gold">🥇 ${safeT(t.tabs?.gold)}</button>
                    <button class="c-tab ${this.activeTab === 'silver' ? 'active' : ''}" data-tab="silver">🥈 ${safeT(t.tabs?.silver)}</button>
                    <button class="c-tab ${this.activeTab === 'currency' ? 'active' : ''}" data-tab="currency">💱 ${safeT(t.tabs?.currency)}</button>
                </div>
                <div class="calc-body">
                    ${this.activeTab === 'gold' ? this.getGoldTemplate(t) : ''}
                    ${this.activeTab === 'silver' ? this.getSilverTemplate(t) : ''}
                    ${this.activeTab === 'currency' ? this.getCurrencyTemplate(t) : ''}
                </div>
            </div>
            ${this.getStyles()}
        `;
        
        // Only refresh if we have valid prices from API
        if (this.goldPricePerGram > 0 || this.silverPricePerGram > 0) {
            this.refreshCalculations();
        }
    },

    renderWidget(container, type) {
        const t = this.getTranslations();
        if (type === 'gold' && this.goldWeight === undefined) this.goldWeight = null; 
        if (type === 'silver' && this.silverWeight === undefined) this.silverWeight = null;
        
        container.innerHTML = `
            <div class="widget-wrapper">
                ${type === 'gold' ? this.getGoldTemplate(t) : this.getSilverTemplate(t)}
            </div>
            ${this.getStyles()}
        `;
        // Only refresh if we have valid prices from API  
        if (this.goldPricePerGram > 0 || this.silverPricePerGram > 0) {
            this.refreshCalculations();
        }
    },

    getGoldTemplate(t) {
        return `
            <div class="calc-input-group">
                <label>${t.labels.weight}</label>
                <input type="number" id="inp-gold-weight" value="${this.goldWeight !== null ? this.goldWeight : ''}" placeholder="0.00" step="0.1" class="c-input">
            </div>
            <div class="calc-input-group">
                <label>${t.labels.purity}</label>
                <div class="chips-grid">
                    ${['24k', '22k', '21k', '18k', '14k'].map(k => `
                        <button class="chip ${this.goldKarat === k ? 'active' : ''}" 
                                onclick="Calculator.setKarat('${k}')">${t.purities[k]}</button>
                    `).join('')}
                </div>
            </div>
            <div class="calc-result-box">
                <div class="c-res-label">${t.labels.result}</div>
                <div class="c-res-main" id="res-gold-eur">€0.00</div>
                <div class="c-res-sub" id="res-gold-usd">$0.00</div>
            </div>
        `;
    },

    getSilverTemplate(t) {
        return `
            <div class="calc-input-group">
                <label>${t.labels.weight}</label>
                <input type="number" id="inp-silver-weight" value="${this.silverWeight !== null ? this.silverWeight : ''}" placeholder="0" step="1" class="c-input">
            </div>
            <div class="calc-input-group">
                <label>${t.labels.purity}</label>
                <div class="chips-grid">
                    ${['999', '925', '800'].map(k => `
                        <button class="chip ${this.silverPurity === k ? 'active' : ''}" 
                                onclick="Calculator.setSilverPurity('${k}')">${t.purities[k]}</button>
                    `).join('')}
                </div>
            </div>
            <div class="calc-result-box silver">
                <div class="c-res-label">${t.labels.result}</div>
                <div class="c-res-main" id="res-silver-eur">€0.00</div>
                <div class="c-res-sub" id="res-silver-usd">$0.00</div>
            </div>
        `;
    },

    getCurrencyTemplate(t) {
        const renderOpts = () => Object.entries(this.currencies).map(([code, data]) => 
            `<option value="${code}">${data.flag} ${code} - ${data.name}</option>`
        ).join('');

        return `
            <div class="curr-container">
                <div class="calc-input-group">
                    <label>${t.labels.amount}</label>
                    <input type="number" id="inp-curr-amount" value="${this.currAmount !== null ? this.currAmount : ''}" placeholder="100" class="c-input big-input">
                </div>
            
                <div class="curr-row">
                    <div class="curr-col">
                        <label>${t.curr.from}</label>
                        <select id="sel-curr-from" class="c-select" onchange="Calculator.setCurrFrom(this.value)">
                            ${renderOpts()}
                        </select>
                    </div>
                    
                    <button class="swap-btn" onclick="Calculator.swapCurrencies()">⇄</button>
                    
                    <div class="curr-col">
                        <label>${t.curr.to}</label>
                        <select id="sel-curr-to" class="c-select" onchange="Calculator.setCurrTo(this.value)">
                            ${renderOpts()}
                        </select>
                    </div>
                </div>

                <button class="btn-convert" onclick="Calculator.calcCurrency()">${t.labels.convert}</button>

                <div class="calc-result-box">
                    <div class="c-res-label">${t.labels.result}</div>
                    <div class="c-res-main" id="res-curr-val">---</div>
                </div>
                
                <div class="gold-power-box">
                    <div class="gp-label">⚖️ ${t.curr.goldPower}</div>
                    <div class="gp-chips">
                        <button class="gp-chip ${this.currencyGoldKarat === '24k' ? 'active' : ''}" onclick="Calculator.setCurrencyGoldKarat('24k')">24K</button>
                        <button class="gp-chip ${this.currencyGoldKarat === '21k' ? 'active' : ''}" onclick="Calculator.setCurrencyGoldKarat('21k')">21K</button>
                        <button class="gp-chip ${this.currencyGoldKarat === '18k' ? 'active' : ''}" onclick="Calculator.setCurrencyGoldKarat('18k')">18K</button>
                    </div>
                    <div class="gp-val" id="res-gold-power">---</div>
                </div>
            </div>
        `;
    },

    setKarat(k) { this.goldKarat = k; this.render(); },
    setSilverPurity(p) { this.silverPurity = p; this.render(); },
    setCurrencyGoldKarat(k) { this.currencyGoldKarat = k; this.render(); },
    setCurrFrom(c) { this.currFrom = c; if(this.currTo === c) this.activeTab = 'currency'; }, // No auto-swap to avoid confusion
    setCurrTo(c) { this.currTo = c; },
    
    swapCurrencies() {
        const temp = this.currFrom;
        this.currFrom = this.currTo;
        this.currTo = temp;
        this.render();
    },

    bindEvents() {
        document.body.addEventListener('click', (e) => {
            if (e.target.dataset.tab) {
                this.activeTab = e.target.dataset.tab;
                this.renderUnifiedApp(document.getElementById('calculatorApp'));
            }
        });

        document.body.addEventListener('input', (e) => {
            const id = e.target.id;
            const val = parseFloat(e.target.value);

            if (id === 'inp-gold-weight') { this.goldWeight = isNaN(val) ? null : val; this.calcGold(); }
            else if (id === 'inp-silver-weight') { this.silverWeight = isNaN(val) ? null : val; this.calcSilver(); }
            else if (id === 'inp-curr-amount') { this.currAmount = isNaN(val) ? null : val; /* Wait for button or enter? Auto-calc is fine too */ this.calcCurrency(); }
        });
    },

    refreshCalculations() {
        if (this.activeTab === 'gold') this.calcGold();
        if (this.activeTab === 'silver') this.calcSilver();
        if (this.activeTab === 'currency') {
            const selFrom = document.getElementById('sel-curr-from');
            const selTo = document.getElementById('sel-curr-to');
            if(selFrom) selFrom.value = this.currFrom;
            if(selTo) selTo.value = this.currTo;
            this.calcCurrency();
        }
    },

    calcGold() {
        // Don't calculate if no valid price from API
        if (!this.goldWeight || this.goldWeight <= 0 || !this.goldPricePerGram || this.goldPricePerGram <= 0) {
            this.updateRes('res-gold-eur', 0, 'EUR');
            this.updateRes('res-gold-usd', 0, 'USD');
            return;
        }
        const pricePerGram = this.goldPricePerGram * this.karatPurity[this.goldKarat];
        const totalEur = pricePerGram * this.goldWeight;
        const totalUsd = totalEur * this.eurUsdRate;
        this.updateRes('res-gold-eur', totalEur, 'EUR');
        this.updateRes('res-gold-usd', totalUsd, 'USD');
    },

    calcSilver() {
        // Don't calculate if no valid price from API
        if (!this.silverWeight || this.silverWeight <= 0 || !this.silverPricePerGram || this.silverPricePerGram <= 0) {
            this.updateRes('res-silver-eur', 0, 'EUR');
            this.updateRes('res-silver-usd', 0, 'USD');
            return;
        }
        const pricePerGram = this.silverPricePerGram * this.karatPurity[this.silverPurity];
        const totalEur = pricePerGram * this.silverWeight;
        const totalUsd = totalEur * this.eurUsdRate;
        this.updateRes('res-silver-eur', totalEur, 'EUR');
        this.updateRes('res-silver-usd', totalUsd, 'USD');
    },

    calcCurrency() {
        if (this.currAmount === null) {
            this.updateRes('res-curr-val', 0, this.currTo);
            document.getElementById('res-gold-power').textContent = '---';
            return;
        }

        // Safety check
        if (!this.rates) return;
        
        const rateFrom = this.rates[this.currFrom] || 1;
        const rateTo = this.rates[this.currTo] || 1;
        
        // 1. Convert Input to USD
        const valInUsd = this.currAmount / rateFrom;
        
        // 2. Convert to Target Currency
        const valConverted = valInUsd * rateTo;
        
        const elRes = document.getElementById('res-curr-val');
        if(elRes) {
             elRes.textContent = new Intl.NumberFormat('de-DE', { style: 'currency', currency: this.currTo }).format(valConverted);
        }
        
        // 3. Gold Purchasing Power
        // We calculate the Gold Price in USD *derived strictly from the active EUR rate*
        // This ensures that if Input is EUR, the conversion factors cancel out perfectly (Input/RateEUR) / (GoldEUR/RateEUR) = Input/GoldEUR
        const rateEur = this.rates['EUR'] || 0.93; 
        const goldPriceUsdDerived = this.goldPricePerGram / rateEur;
        
        if (goldPriceUsdDerived > 0) {
            const purity = this.karatPurity[this.currencyGoldKarat] || 1;
            const pricePerGramSelected = goldPriceUsdDerived * purity;
            
            const grams = valInUsd / pricePerGramSelected;
            const elGold = document.getElementById('res-gold-power');
            if(elGold) elGold.textContent = `${grams.toFixed(3)} g (${this.currencyGoldKarat})`;
        }
    },

    updateRes(id, val, curr) {
        const el = document.getElementById(id);
        if(el) el.textContent = this.fmt(val, curr);
    },

    fmt(val, curr) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: curr }).format(val);
    },
    
    getStyles() {
        return `
            <style>
                .calc-app-wrapper { font-family: 'Inter', sans-serif; }
                .calc-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 5px; }
                .c-tab { background: none; border: none; padding: 10px 15px; cursor: pointer; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; transition: all 0.2s; border-radius: 8px 8px 0 0; }
                .c-tab:hover { color: var(--text-primary); background: var(--bg-secondary); }
                .c-tab.active { color: var(--color-gold); border-bottom: 3px solid var(--color-gold); margin-bottom: -7px; background: var(--bg-card); }
                
                .calc-body { padding: 10px 0; }
                .calc-input-group { margin-bottom: 20px; }
                .calc-input-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
                .c-input { width: 100%; padding: 12px 15px; border: 1px solid var(--border-color); background: var(--bg-input); border-radius: 8px; font-size: 1.1rem; color: var(--text-primary); transition: border-color 0.2s; }
                .c-input:focus { border-color: var(--color-gold); outline: none; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1); }
                
                .chips-grid { display: flex; flex-wrap: wrap; gap: 8px; }
                .chip { border: 1px solid var(--border-color); background: var(--bg-secondary); padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; color: var(--text-secondary); }
                .chip:hover { border-color: var(--color-gold); }
                .chip.active { background: var(--color-gold); color: #000; border-color: var(--color-gold); font-weight: 600; }
                
                .calc-result-box { background: var(--bg-secondary); padding: 20px; border-radius: 12px; text-align: center; margin-top: 10px; border: 1px solid var(--border-color); }
                .calc-result-box.silver { border-top: 4px solid #C0C0C0; }
                .c-res-label { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 5px; }
                .c-res-main { font-size: 2rem; font-weight: 800; color: var(--color-gold); font-family: var(--font-mono); }
                .c-res-sub { font-size: 1rem; color: var(--text-secondary); margin-top: 5px; }
                
                /* Currency Specific Styles */
                .curr-container { max-width: 600px; margin: 0 auto; }
                .curr-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 20px; }
                .curr-col { flex: 1; }
                .c-select { width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 1rem; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
                .c-select option { background: var(--bg-card); color: var(--text-primary); }
                
                .swap-btn { background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0; margin-bottom: 2px; }
                .swap-btn:hover { border-color: var(--color-gold); color: var(--color-gold); transform: rotate(180deg); }
                
                .btn-convert { width: 100%; background: var(--color-gold); color: #000; font-weight: 700; padding: 14px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: 0.2s; margin-bottom: 15px; }
                .btn-convert:hover { opacity: 0.9; transform: translateY(-2px); }
                
                .gold-power-box { background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 15px; text-align: center; margin-top: 20px; }
                .gp-label { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 5px; }
                .gp-val { font-size: 1.5rem; font-weight: bold; color: var(--color-gold); font-family: var(--font-mono); }
                
                /* Dark Mode Override Updates */
                [data-theme="dark"] .c-select { background-color: #1a1a1a; border-color: #333; color: white; }
                [data-theme="dark"] .c-input { background-color: #1a1a1a; border-color: #333; color: white; }
                [data-theme="dark"] .swap-btn { background-color: #2d2d2d; border-color: #444; }
                
                .gp-chips { display: flex; justify-content: center; gap: 8px; margin-bottom: 5px; }
                .gp-chip { background: transparent; border: 1px solid var(--color-gold); color: var(--color-gold); padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; opacity: 0.6; }
                .gp-chip:hover { opacity: 1; background: rgba(255, 215, 0, 0.1); }
                .gp-chip.active { background: var(--color-gold); color: #000; opacity: 1; font-weight: bold; }
            </style>
        `;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => Calculator.init());
}
if (typeof module !== 'undefined' && module.exports) module.exports = Calculator;
