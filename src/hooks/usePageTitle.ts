import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTitle = (title: string) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title directly as a fallback
    document.title = title;
  }, [title, location.pathname]);

  return title;
}; 