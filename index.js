import { POLYGON_API_KEY, WXPUSHER_APP_TOKEN, WXPUSHER_TOPIC_ID } from './config.js';
const  axios = require('axios')
/**
 * timespan: hour/day/week (default: day)
 * The size of the aggregate time window.
 * doc: https://polygon.io/docs/crypto/get_v1_indicators_rsi__cryptoticker
 * window: 6/14 (default: 6)    
 * The window size used to calculate the relative strength index (RSI). 
 * For example, a window size of 10 with daily aggregates would result in a 10 day moving average.
 */
async function fetchRSI(ticker = 'BTCUSD', timespan = 'day', window = 6) {
    try {
        const response = await axios.get(`https://api.polygon.io/v1/indicators/rsi/X:${ticker}`, {
            params: {
                timespan,
                window,
                series_type: 'close',
                expand_underlying: false,
                order: 'desc',
                limit: 1,
                apiKey: POLYGON_API_KEY
            }
        });
        const latestValue = response.data.results.values[0];
        const rsi = latestValue?.value;
        console.log(`${ticker}: ${rsi.toFixed(2)}`);
        return { ticker: ticker.split('USD')[0], rsi: rsi.toFixed(2), timestamp: latestValue.timestamp };
    } catch (error) {
        console.error(`Error: ${error?.message}`);
        throw error; // Changed reject to throw for better error handling
    }
}

// 获取指定加密货币的RSI14，当日数据，默认获取BTC和ETH
async function fetchRSIsForCryptos(cryptos = ['BTCUSD', 'ETHUSD']) {
    console.log(`Fetching RSI for ${cryptos.length} cryptos: ${cryptos}`);
    console.log(`Date: ${new Date().toLocaleDateString()}`);
    console.log('----------------------------------------');

    const date = new Date().toLocaleDateString();
    let message = `<h3>一、RSI6-日线更新</h3><br><p>Date: ${date}</p>`;
    let title = 'RSI-1d:';

    try {
        const results = await Promise.all(cryptos.map(crypto => fetchRSI(crypto, 'day', 6)));

        results.forEach(({ ticker, rsi }) => {
            const signal = rsi > 70 ? '超买🔴' : rsi < 30 ? '超卖🔵' : '';
            const singleMessage = `${ticker}: ${rsi}${signal}`;
            title += ` ${singleMessage}`;
            message += `<br><p>${singleMessage}</p>`;
        });

        message += await getFearAndGreedIndex();
        console.log('FINAL MESSAGE:', message);
        await sendNotification(title, message);
    } catch (error) {
        console.error('Error in fetchRSIsForCryptos:', error);
    }
}

async function getFearAndGreedIndex() {
    let fearIndexMessage = '<br><h3>二、当日恐慌指数</h3>';

    try {
        const response = await axios.get("https://api.alternative.me/fng/");
        const value = response.data?.data?.[0]?.value || '--';
        fearIndexMessage += `<br><p>当日指数: ${value}</p>`;
    } catch (error) {
        console.error('Error fetching Fear and Greed Index:', error);
        fearIndexMessage += '<br><p>获取恐慌指数失败</p>';
    }

    fearIndexMessage += '<img src="https://alternative.me/crypto/fear-and-greed-index.png" alt="Crypto Fear and Greed Index"/>';
    return fearIndexMessage;
}

// 获取指定加密货币的Funding Rate History，默认获取BTC  
function fetchFundingRateHistory(ticker = 'BTCUSDT') {
    axios.get("https://api.bybit.com/v5/market/funding/history", {
        params: {
            category: "linear",
            symbol: ticker,
            limit: 10
        }
    })
        .then(response => {
            const list = response.data?.result?.list || [];
            list.forEach(item => {
                console.log(item.fundingRate, new Date(+item.fundingRateTimestamp).toLocaleString());
            });
        })
        .catch(error => {
            console.error(error);
        });
}

async function sendNotification(title, message) {
    console.log('Sending notification:', { title, message });
    try {
        const response = await axios.post("https://wxpusher.zjiecode.com/api/send/message", {
            appToken: WXPUSHER_APP_TOKEN,
            summary: title,
            content: message,
            contentType: 2,
            topicIds: WXPUSHER_TOPIC_ID,
        });
        console.log('Notification sent:', response.data);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function mainFunction() {
    try {
        await fetchRSIsForCryptos(['BTCUSD', 'ETHUSD', 'SOLUSD']);
        // Uncomment the following lines if needed:
        // await fetchFundingRateHistory('MNTUSDT');
        // await sendNotification('Test notification');
    } catch (error) {
        console.error('Error in mainFunction:', error);
    }
}

mainFunction();
