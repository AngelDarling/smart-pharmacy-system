import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const CACHE_KEY = 'health_news_categories';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useHealthNewsCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setCategories(data);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from API
      const response = await axios.get(`${API_URL}/health-news-categories`);
      const data = response.data;
      
      // Update state
      setCategories(data);
      
      // Update cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchCategories(true);
  };

  return { categories, loading, error, refreshCategories: invalidateCache };
}
