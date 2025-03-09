import { getCryptoSignals, getTopCryptos } from './crypto-signals.js';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

async function fetchTopCryptos() {
    try {
        const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`);
        const cryptos = await response.json();
        return cryptos.map(crypto => ({
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            price: crypto.current_price,
            priceChange24h: crypto.price_change_percentage_24h,
            marketCap: crypto.market_cap
        }));
    } catch (error) {
        console.error('Error fetching top cryptos:', error);
        return [];
    }
}

function renderTopCryptos(cryptos) {
    const container = document.getElementById('topCryptosContainer');
    container.innerHTML = cryptos.map(crypto => `
        <div class="col-12 mb-2">
            <div class="crypto-card p-3 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${crypto.name} (${crypto.symbol})</h5>
                    <small class="text-muted">Market Cap: $${(crypto.marketCap / 1_000_000).toFixed(2)}M</small>
                </div>
                <div class="text-end">
                    <h6 class="mb-1">$${crypto.price.toFixed(2)}</h6>
                    <small class="${crypto.priceChange24h > 0 ? 'text-success' : 'text-danger'}">
                        ${crypto.priceChange24h.toFixed(2)}%
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCryptoSignals(signals) {
    const container = document.getElementById('cryptoSignalsContainer');
    container.innerHTML = signals.map(signal => `
        <div class="crypto-card p-3 mb-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${signal.pair}</h5>
                <span class="signal-badge ${
                    signal.signalType === 'BUY' ? 'bg-success text-white' : 
                    signal.signalType === 'SELL' ? 'bg-danger text-white' : 'bg-secondary text-white'
                }">
                    ${signal.signalType}
                </span>
            </div>
            <div class="row">
                <div class="col-6">
                    <small class="text-muted">Entry Price</small>
                    <p class="mb-0">$${signal.entryPrice}</p>
                </div>
                <div class="col-6 text-end">
                    <small class="text-muted">24h Change</small>
                    <p class="mb-0 ${signal.priceChange24h > 0 ? 'text-success' : 'text-danger'}">
                        ${signal.priceChange24h}%
                    </p>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-4">
                    <small class="text-muted">Target</small>
                    <p class="mb-0">$${signal.targetPrice}</p>
                </div>
                <div class="col-4">
                    <small class="text-muted">Stop Loss</small>
                    <p class="mb-0">$${signal.stopLoss}</p>
                </div>
                <div class="col-4 text-end">
                    <small class="text-muted">Gain %</small>
                    <p class="mb-0 ${signal.potentialGain > 0 ? 'text-success' : 'text-danger'}">
                        ${signal.potentialGain}%
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

function setupBottomNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = {
        marketOverview: document.getElementById('marketOverviewSection'),
        signals: document.getElementById('signalsSection'),
        portfolio: document.getElementById('portfolioSection')
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');

            Object.values(sections).forEach(section => section.classList.add('d-none'));

            const sectionId = item.dataset.section;
            sections[sectionId].classList.remove('d-none');
        });
    });
}

async function initializeApp() {
    const topCryptos = await fetchTopCryptos();
    renderTopCryptos(topCryptos);

    const cryptoSignals = await getCryptoSignals();
    renderCryptoSignals(cryptoSignals);

    setupBottomNavigation();
}

document.addEventListener('DOMContentLoaded', initializeApp);
