import { useState } from 'react';
import {
  clearRecentSearches,
  readRecentSearches,
  saveRecentSearch,
} from '../utils/searchHistory';

function useRecentSearches() {
  const [searches, setSearches] = useState(() => readRecentSearches());

  const addSearch = (payload) => {
    const next = saveRecentSearch(payload);
    setSearches(next);
  };

  const clearAll = () => {
    clearRecentSearches();
    setSearches([]);
  };

  return {
    searches,
    addSearch,
    clearAll,
  };
}

export default useRecentSearches;
