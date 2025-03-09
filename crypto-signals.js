export async function getTopCryptos() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false');
        const cryptos = await response.json();
        return cryptos
            .filter(crypto => crypto.market_cap > 50_000_000) 
            .map(crypto => ({
                name: crypto.name,
                symbol: crypto.symbol.toUpperCase(),
                currentPrice: crypto.current_price,
                marketCap: crypto.market_cap,
                priceChangePercentage24h: crypto.price_change_percentage_24h,
                rank: crypto.market_cap_rank
            }));
    } catch (error) {
        console.error('Error fetching top cryptocurrencies:', error);
        return [];
    }
}

export async function getCryptoSignals() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        const cryptos = await response.json();

        return cryptos
            .filter(crypto => crypto.market_cap > 50_000_000)
            .map(crypto => {
                const { signalType, confidence } = generateSignalAnalysis(crypto);
                const entryPrice = crypto.current_price;
                const targetPrice = calculateTargetPrice(crypto, signalType);
                const stopLoss = calculateStopLoss(crypto, signalType);

                return {
                    pair: `${crypto.symbol.toUpperCase()}/USDT`,
                    name: crypto.name,
                    signalType,
                    entryPrice: entryPrice.toFixed(4),
                    targetPrice: targetPrice.toFixed(4),
                    stopLoss: stopLoss.toFixed(4),
                    potentialGain: ((targetPrice - entryPrice) / entryPrice * 100).toFixed(2),
                    riskReward: calculateRiskReward(entryPrice, targetPrice, stopLoss),
                    confidence: Math.floor(Math.random() * 100), // Random confidence for demonstration
                    priceChange24h: crypto.price_change_percentage_24h.toFixed(2)
                };
            })
            .filter(signal => signal.signalType !== 'NEUTRAL')
            .sort((a, b) => Math.abs(parseFloat(b.potentialGain)) - Math.abs(parseFloat(a.potentialGain)))
            .slice(0, 20); // Top 20 signals
    } catch (error) {
        console.error('Error generating crypto signals:', error);
        return [];
    }
}

function generateSignalAnalysis(crypto) {
    const { price_change_percentage_24h: priceChange } = crypto;
    
    let signalType = 'NEUTRAL';
    
    if (priceChange > 5) {
        signalType = 'BUY';
    } else if (priceChange < -5) {
        signalType = 'SELL';
    }

    return { signalType, confidence: Math.abs(priceChange) * 2 };
}

function calculateTargetPrice(crypto, signalType) {
    const currentPrice = crypto.current_price;
    return signalType === 'BUY' 
        ? currentPrice * 1.1 
        : signalType === 'SELL' 
            ? currentPrice * 0.9 
            : currentPrice;
}

function calculateStopLoss(crypto, signalType) {
    const currentPrice = crypto.current_price;
    return signalType === 'BUY' 
        ? currentPrice * 0.95 
        : signalType === 'SELL' 
            ? currentPrice * 1.05 
            : currentPrice;
}

function calculateRiskReward(entry, target, stopLoss) {
    const potentialProfit = Math.abs(target - entry);
    const potentialLoss = Math.abs(entry - stopLoss);
    return potentialLoss > 0 ? `1:${(potentialProfit / potentialLoss).toFixed(2)}` : '1:1';
}

export async function getCryptoHistoricalData(symbol, days = 30) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`);
        const historicalData = await response.json();
        
        const labels = historicalData.prices.map((_, index) => index);
        const prices = historicalData.prices.map(price => price[1]);
        
        return {
            labels: labels,
            datasets: [{
                label: `${symbol.toUpperCase()} Price`,
                data: prices,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        return null;
    }
}
