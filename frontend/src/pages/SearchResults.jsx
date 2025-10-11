import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    // Redirect to products page with search query
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }, [query, navigate]);

  return null;
}