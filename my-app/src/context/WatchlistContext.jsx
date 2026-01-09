import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

const LOCAL_STORAGE_KEY = 'stockApp.watchlist';

export const useWatchlistContext = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedWatchlist = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedWatchlist) {
      try {
        setWatchlist(JSON.parse(storedWatchlist));
      } catch (error) {
        console.error("Failed to parse watchlist from local storage", error);
      }
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

  const value = {
    watchlist,
    addSymbol,
    removeSymbol,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
