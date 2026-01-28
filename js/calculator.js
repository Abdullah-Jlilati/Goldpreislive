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
    
    // NEW: Multi-Karat Gold Calculator State
    multiKaratItems: [],
    
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
        }

        // 2. FORCE Consistency: Sync EUR rate with Gold Price's EUR/USD rate.
        // ONLY if we don't have external rates (fallback mode).
        // If we have API rates, trust them over the implied gold rate.
        if (this.eurUsdRate && (!rates || Object.keys(rates).length === 0)) {
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
                tabs: { 
                    gold: 'Gold Rechner', 
                    silver: 'Silber Rechner', 
                    currency: 'Währungsrechner',
                    multiKarat: 'Multi-Karat Gold'
                },
                labels: { 
                    weight: 'Gewicht (Gramm)', 
                    purity: 'Feinheit / Karat', 
                    amount: 'Betrag', 
                    result: 'Ergebnis', 
                    convert: 'Umrechnen',
                    add: 'Hinzufügen',
                    calculate: 'Berechnen',
                    totalValue: 'Gesamtwert',
                    equivalentIn: 'Entspricht',
                    priceInEur: 'Preis in Euro',
                    priceInUsd: 'Preis in US-Dollar',
                    addItem: 'Element hinzufügen',
                    remove: 'Entfernen',
                    karat: 'Karat'
                },
                purities: { 
                    '24k': '24K (999)', 
                    '22k': '22K (916)', 
                    '21k': '21K (875)', 
                    '18k': '18K (750)', 
                    '14k': '14K (585)', 
                    '999': 'Feinsilber 999', 
                    '925': 'Sterling 925', 
                    '800': 'Silber 800' 
                },
                curr: { 
                    from: 'Von', 
                    to: 'Nach', 
                    goldPower: 'Gold Kaufkraft',
                    currency: 'Währung'
                }
            },
            ar: {
                tabs: { 
                    gold: 'حاسبة الذهب', 
                    silver: 'حاسبة الفضة', 
                    currency: 'محول العملات',
                    multiKarat: 'ذهب متعدد العيارات'
                },
                labels: { 
                    weight: 'الوزن (جرام)', 
                    purity: 'القيراط / النقاء', 
                    amount: 'المبلغ', 
                    result: 'النتيجة', 
                    convert: 'تحويل',
                    add: 'إضافة',
                    calculate: 'حساب',
                    totalValue: 'القيمة الإجمالية',
                    equivalentIn: 'يعادل',
                    priceInEur: 'السعر باليورو',
                    priceInUsd: 'السعر بالدولار الأمريكي',
                    addItem: 'إضافة عنصر',
                    remove: 'حذف',
                    karat: 'القيراط'
                },
                purities: { 
                    '24k': '24 قيراط', 
                    '22k': '22 قيراط', 
                    '21k': '21 قيراط', 
                    '18k': '18 قيراط', 
                    '14k': '14 قيراط', 
                    '999': 'فضة نقية 999', 
                    '925': 'استرليني 925', 
                    '800': 'فضة 800' 
                },
                curr: { 
                    from: 'من', 
                    to: 'إلى', 
                    goldPower: 'قدرة شراء الذهب',
                    currency: 'العملة'
                }
            },
            en: {
                tabs: { 
                    gold: 'Gold Calc', 
                    silver: 'Silver Calc', 
                    currency: 'Currency Conv',
                    multiKarat: 'Multi-Karat Gold'
                },
                labels: { 
                    weight: 'Weight (grams)', 
                    purity: 'Purity / Karat', 
                    amount: 'Amount', 
                    result: 'Result', 
                    convert: 'Convert',
                    add: 'Add',
                    calculate: 'Calculate',
                    totalValue: 'Total Value',
                    equivalentIn: 'Equivalent in',
                    priceInEur: 'Price in Euro',
                    priceInUsd: 'Price in US Dollar',
                    addItem: 'Add Item',
                    remove: 'Remove',
                    karat: 'Karat'
                },
                purities: { 
                    '24k': '24K (999)', 
                    '22k': '22K (916)', 
                    '21k': '21K (875)', 
                    '18k': '18K (750)', 
                    '14k': '14K (585)', 
                    '999': 'Fine Silver 999', 
                    '925': 'Sterling 925', 
                    '800': 'Silver 800' 
                },
                curr: { 
                    from: 'From', 
                    to: 'To', 
                    goldPower: 'Gold Purchasing Power',
                    currency: 'Currency'
                }
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
                    <button class="c-tab ${this.activeTab === 'multiKarat' ? 'active' : ''}" data-tab="multiKarat">💎 ${safeT(t.tabs?.multiKarat)}</button>
                    <button class="c-tab ${this.activeTab === 'currency' ? 'active' : ''}" data-tab="currency">💱 ${safeT(t.tabs?.currency)}</button>
                </div>
                <div class="calc-body">
                    ${this.activeTab === 'gold' ? this.getGoldTemplate(t) : ''}
                    ${this.activeTab === 'silver' ? this.getSilverTemplate(t) : ''}
                    ${this.activeTab === 'multiKarat' ? this.getMultiKaratTemplate(t) : ''}
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
                <input type="number" 
                       lang="en" 
                       dir="ltr" 
                       id="inp-gold-weight" 
                       value="${this.goldWeight !== null ? this.goldWeight : ''}" 
                       placeholder="0" 
                       step="1" 
                       class="c-input">
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
                <div class="c-res-row">
                    <span class="c-currency-label">EUR</span>
                    <div class="c-res-main" id="res-gold-eur">€0.00</div>
                </div>
                <div class="c-res-row">
                    <span class="c-currency-label">USD</span>
                    <div class="c-res-sub" id="res-gold-usd">$0.00</div>
                </div>
            </div>
        `;
    },

    getSilverTemplate(t) {
        return `
            <div class="calc-input-group">
                <label>${t.labels.weight}</label>
                <input type="number" 
                       lang="en" 
                       dir="ltr" 
                       id="inp-silver-weight" 
                       value="${this.silverWeight !== null ? this.silverWeight : ''}" 
                       placeholder="0" 
                       step="1" 
                       class="c-input">
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
                <div class="c-res-row">
                    <span class="c-currency-label">EUR</span>
                    <div class="c-res-main" id="res-silver-eur">€0.00</div>
                </div>
                <div class="c-res-row">
                    <span class="c-currency-label">USD</span>
                    <div class="c-res-sub" id="res-silver-usd">$0.00</div>
                </div>
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
                    <input type="number" 
                           lang="en" 
                           dir="ltr" 
                           id="inp-curr-amount" 
                           value="${this.currAmount !== null ? this.currAmount : ''}" 
                           placeholder="100" 
                           class="c-input big-input">
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
        if (this.activeTab === 'multiKarat') { /* Multi-karat needs manual calc button */ }
        if (this.activeTab === 'currency') {
            const selFrom = document.getElementById('sel-curr-from');
            const selTo = document.getElementById('sel-curr-to');
            if(selFrom) selFrom.value = this.currFrom;
            if(selTo) selTo.value = this.currTo;
            this.calcCurrency();
        }
        if (this.activeTab === 'multiCurrency') { /* Multi-currency needs manual calc button */ }
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
                .c-res-label { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 10px; }
                .c-res-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 8px 0; }
                .c-currency-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); background: rgba(212, 175, 55, 0.1); padding: 4px 8px; border-radius: 4px; min-width: 40px; text-align: center; }
                .c-res-main { font-size: 2rem; font-weight: 800; color: var(--color-gold); font-family: var(--font-mono); }
                .c-res-sub { font-size: 2rem; font-weight: 800; color: var(--color-gold); font-family: var(--font-mono); }
                
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
                
                /* Multi-Karat & Multi-Currency Styles */
                .multi-item { background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; gap: 10px; align-items: center; border: 1px solid var(--border-color); }
                .multi-item input, .multi-item select { flex: 1; min-width: 80px; }
                .multi-item button { flex-shrink: 0; background: #dc2626; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
                .multi-item button:hover { background: #b91c1c; }
                .multi-add-btn { width: 100%; background: var(--color-gold); color: #000; font-weight: 600; padding: 10px; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 15px; }
                .multi-add-btn:hover { opacity: 0.9; }
                .multi-calc-btn { width: 100%; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #000; font-weight: 700; padding: 14px; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 15px; font-size: 1.05rem; }
                .multi-calc-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }
                .equivalents-box { background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 15px; margin-top: 15px; }
                .equiv-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
                .equiv-item:last-child { border-bottom: none; }
                .equiv-label { font-weight: 600; color: var(--text-secondary); }
                .equiv-value { font-family: var(--font-mono); color: var(--color-gold); font-weight: 700; }
            </style>
        `;
    },
    
    // NEW: Multi-Karat Gold Template
    getMultiKaratTemplate(t) {
        return `
            <div class="multi-karat-container">
                <div id="multi-karat-items">
                    ${this.multiKaratItems.map((item, idx) => `
                        <div class="multi-item" data-index="${idx}">
                            <input type="number" 
                                   lang="en"
                                   dir="ltr"
                                   class="c-input" 
                                   value="${item.weight > 0 ? item.weight : ''}" 
                                   placeholder="${t.labels.weight}" 
                                   onchange="Calculator.updateMultiKaratItem(${idx}, 'weight', this.value)">
                            <select class="c-select" 
                                    onchange="Calculator.updateMultiKaratItem(${idx}, 'karat', this.value)">
                                ${['24k', '22k', '21k', '18k', '14k'].map(k => 
                                    `<option value="${k}" ${item.karat === k ? 'selected' : ''}>${t.purities[k]}</option>`
                                ).join('')}
                            </select>
                            <button onclick="Calculator.removeMultiKaratItem(${idx})">${t.labels.remove}</button>
                        </div>
                    `).join('')}
                </div>
                
                <button class="multi-add-btn" onclick="Calculator.addMultiKaratItem()">
                    ➕ ${t.labels.addItem}
                </button>
                
                <button class="multi-calc-btn" onclick="Calculator.calcMultiKarat()">
                    ${t.labels.calculate}
                </button>
                
                <!-- Detailed Breakdown Section -->
                <div id="multi-karat-details" style="display:none; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: var(--text-secondary); font-size: 0.9rem; text-align: center;">${t.labels.result} (Details)</h4>
                    <div id="multi-karat-details-list" style="background: var(--bg-secondary); border-radius: 8px; overflow: hidden;"></div>
                </div>

                <div class="calc-result-box">
                    <div class="c-res-label">${t.labels.totalValue}</div>
                    <div class="c-res-main" id="res-multi-karat-eur">€0.00</div>
                    <div class="c-res-sub" id="res-multi-karat-usd">$0.00</div>
                </div>
                
                <div class="equivalents-box" id="multi-karat-equivalents" style="display:none;">
                    <div class="c-res-label">${t.labels.equivalentIn}</div>
                    <div id="equiv-list"></div>
                </div>
            </div>
        `;
    },
    
    // NEW: Multi-Karat Gold Functions
    addMultiKaratItem() {
        this.multiKaratItems.push({ weight: 0, karat: '24k' });
        this.render();
    },
    
    removeMultiKaratItem(idx) {
        this.multiKaratItems.splice(idx, 1);
        this.render();
    },
    
    updateMultiKaratItem(idx, field, value) {
        if (this.multiKaratItems[idx]) {
            this.multiKaratItems[idx][field] = field === 'weight' ? parseFloat(value) : value;
        }
    },
    
    calcMultiKarat() {
        if (!this.goldPricePerGram || this.goldPricePerGram <= 0) {
            alert('Gold price not yet loaded. Please wait...');
            return;
        }
        
        let totalValueEur = 0;
        let total24kEquiv = 0;
        
        const detailsContainer = document.getElementById('multi-karat-details');
        const detailsList = document.getElementById('multi-karat-details-list');
        let detailsHTML = '';
        const t = this.getTranslations();

        this.multiKaratItems.forEach(item => {
            if (item.weight > 0) {
                const purity = this.karatPurity[item.karat] || 1;
                const valueEur = item.weight * this.goldPricePerGram * purity;
                const valueUsd = valueEur * this.eurUsdRate;
                
                totalValueEur += valueEur;
                total24kEquiv += item.weight * purity; // Convert to 24k equivalent
                
                // Add detail row (e.g. 10g 24k: 785 € / 850 $)
                detailsHTML += `
                    <div style="padding: 10px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-weight: bold; color: var(--color-gold);">${item.weight}g</span> 
                            <span style="color: var(--text-secondary);">x</span> 
                            <span style="font-weight: bold;">${t.purities[item.karat]}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; font-family: var(--font-mono); direction: ltr;">€${valueEur.toFixed(2)}</div>
                            <div style="font-weight: bold; font-family: var(--font-mono); direction: ltr;">$${valueUsd.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }
        });
        
        if(detailsHTML && detailsContainer && detailsList) {
            detailsList.innerHTML = detailsHTML;
            detailsContainer.style.display = 'block';
        } else if (detailsContainer) {
            detailsContainer.style.display = 'none';
        }

        const totalValueUsd = totalValueEur * this.eurUsdRate;
        
        // Update results
        this.updateRes('res-multi-karat-eur', totalValueEur, 'EUR');
        this.updateRes('res-multi-karat-usd', totalValueUsd, 'USD');
        
        // Calculate equivalents in all karats
        const equivBox = document.getElementById('multi-karat-equivalents');
        const equivList = document.getElementById('equiv-list');
        
        if (equivBox && equivList && total24kEquiv > 0) {
            equivBox.style.display = 'block';
            
            const karats = ['24k', '22k', '21k', '18k', '14k'];
            equivList.innerHTML = karats.map(k => {
                const purity = this.karatPurity[k];
                const equivWeight = total24kEquiv / purity;
                return `
                    <div class="equiv-item">
                        <span class="equiv-label">${t.purities[k]}</span>
                        <span class="equiv-value">${equivWeight.toFixed(2)} g</span>
                    </div>
                `;
            }).join('');
        }
    },
};

// Auto-init
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => Calculator.init());
}
if (typeof module !== 'undefined' && module.exports) module.exports = Calculator;
