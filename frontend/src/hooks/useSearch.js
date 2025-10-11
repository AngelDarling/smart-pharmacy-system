import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Hook quản lý tìm kiếm với debounce và localStorage
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({
    keywords: [],
    products: [],
    categories: [],
    hotDeals: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history từ localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length < 2) {
        setSuggestions({
          keywords: [],
          products: [],
          categories: [],
          hotDeals: []
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(term)}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions({
          keywords: [],
          products: [],
          categories: [],
          hotDeals: []
        });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Save search to history
  const saveToHistory = (term) => {
    if (!term || term.length < 2) return;
    
    const trimmedTerm = term.trim();
    const newHistory = [trimmedTerm, ...searchHistory.filter(item => item !== trimmedTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Remove specific item from history
  const removeFromHistory = (term) => {
    const newHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    isLoading,
    searchHistory,
    handleSearchChange,
    saveToHistory,
    clearHistory,
    removeFromHistory
  };
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default useSearch;
