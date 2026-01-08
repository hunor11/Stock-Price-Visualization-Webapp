import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'stockApp.watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const storedWatchlist = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  const updateLocalStorage = (newList) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
    setWatchlist(newList);
  };

  const addSymbol = (symbol) => {
    if (symbol && !watchlist.includes(symbol)) {
      const newList = [...watchlist, symbol];
      updateLocalStorage(newList);
    }
  };

  const removeSymbol = (symbol) => {
    const newList = watchlist.filter((s) => s !== symbol);
    updateLocalStorage(newList);
  };

  return {
    watchlist,
    addSymbol,
    removeSymbol,
  };
};
