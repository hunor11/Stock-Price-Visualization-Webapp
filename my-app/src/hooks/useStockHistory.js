import { useState, useEffect } from 'react';

/**
 * TUTORIAL: How to set up Twelve Data
 * ----------------------------------
 * 1. Go to https://twelvedata.com/ and sign up for a free API Key.
 * 2. Create a file named .env in your project root (next to package.json).
 * 3. Add this line to the .env file: 
 * VITE_TWELVE_DATA_API_KEY=your_actual_api_key_here
 * 4. Restart your Vite server (npm run dev) to load the new env variable.
 */

// Accessing the key securely from the environment variables
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/time_series';

export const useStockHistory = (symbol, interval = '1day', outputsize = 500) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent fetching if no symbol is provided
    if (!symbol) {
      setLoading(false);
      setData([]);
      return;
    }

    let isActive = true;

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);

      try {
        // CHECK: Ensure API key is present
        if (!API_KEY) {
          throw new Error('API Key is missing. Check your .env file.');
        }

        // STEP 1: Construct the API URL
        const url = `${BASE_URL}?symbol=${symbol}&interval=${interval}&apikey=${API_KEY}&outputsize=${outputsize}`;

        // STEP 2: Fetch Data
        const response = await fetch(url);
        if (!isActive) return;

        const result = await response.json();
        if (!isActive) return;


        // STEP 3: Handle Twelve Data specific errors
        if (result.status === 'error') {
          throw new Error(result.message || 'Failed to fetch data from Twelve Data.');
        }

        // STEP 4: Data Transformation
        // The API returns an object with a 'values' array.
        // We need to map this to the format required by Lightweight Charts.
        // Format: { time: 'YYYY-MM-DD', open: number, high: number, low: number, close: number }
        const values = result.values || [];
        const formattedData = values.map((item) => ({
          time: item.datetime, // Twelve Data uses 'datetime', Charts need 'time'
          open: parseFloat(item.open),   // API returns strings, we need numbers
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume, 10) // Optional, but good to have
        }));

        // STEP 5: Sorting
        // Twelve Data returns the NEWEST data first (index 0 is today).
        // Lightweight Charts requires the OLDEST data first (ascending order).
        // We use .reverse() because the array is already sorted by date, just backwards.
        const sortedData = formattedData.reverse();

        if (isActive) {
          setData(sortedData);
        }

      } catch (err) {
        if (isActive) {
          console.error('Stock Fetch Error:', err);
          setError(err.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchPrices();

    return () => {
      isActive = false;
    }
  }, [symbol, interval, outputsize]); // The effect re-runs whenever these dependencies change

  return { data, loading, error };
};