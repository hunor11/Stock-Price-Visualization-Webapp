import React, { createContext, useContext, useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/time_series';

const StockDataContext = createContext();

export const useStockData = () => useContext(StockDataContext);

export const StockDataProvider = ({ children }) => {
    const [cache, setCache] = useState({});
    const [loadingSymbols, setLoadingSymbols] = useState(new Set());

    const fetchHistory = useCallback(async (symbol, interval = '1day', outputsize = 500) => {
        const cacheKey = `${symbol}-${interval}-${outputsize}`;
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        if (!API_KEY) {
            throw new Error('API Key is missing. Check your .env file.');
        }

        setLoadingSymbols(prev => new Set(prev).add(symbol));

        try {
            const url = `${BASE_URL}?symbol=${symbol}&interval=${interval}&apikey=${API_KEY}&outputsize=${outputsize}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.status === 'error') {
                throw new Error(result.message || 'Failed to fetch data from Twelve Data.');
            }

            const values = Array.isArray(result.values) ? result.values : [];
            const formattedData = values.map((item) => ({
                time: item.datetime,
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseInt(item.volume, 10)
            })).reverse();
            
            setCache(prev => ({ ...prev, [cacheKey]: formattedData }));
            return formattedData;

        } catch (error) {
            console.error(`Failed to fetch stock history for ${symbol}:`, error);
            throw error; // Re-throw to be caught by the calling hook
        } finally {
            setLoadingSymbols(prev => {
                const newSet = new Set(prev);
                newSet.delete(symbol);
                return newSet;
            });
        }
    }, [cache]); // Dependency on cache is important

    const value = {
        fetchHistory,
        loadingSymbols,
        // Potentially expose cache or other things if needed
    };

    return (
        <StockDataContext.Provider value={value}>
            {children}
        </StockDataContext.Provider>
    );
};
