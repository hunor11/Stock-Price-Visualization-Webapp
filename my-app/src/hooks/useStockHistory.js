import { useState, useEffect } from 'react';
import { useStockData } from '../context/StockDataContext';

export const useStockHistory = (symbol, interval = '1day', outputsize = 500) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const { fetchHistory, loadingSymbols } = useStockData();

  const loading = loadingSymbols.has(symbol);

  useEffect(() => {
    if (!symbol) {
      setData([]);
      return;
    }

    let isActive = true;

    const getHistory = async () => {
      setError(null);
      try {
        const history = await fetchHistory(symbol, interval, outputsize);
        if (isActive) {
          setData(history);
        }
      } catch (err) {
        if (isActive) {
          console.error(`Error in useStockHistory for ${symbol}:`, err);
          setError(err.message);
        }
      }
    };

    getHistory();

    return () => {
      isActive = false;
    };
  }, [symbol, interval, outputsize, fetchHistory]);

  return { data, loading, error };
};