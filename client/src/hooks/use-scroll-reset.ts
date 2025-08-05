import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to reset scroll position when navigating between routes
 * Works by finding the Layout's main scroll container and resetting it to top
 */
export const useScrollReset = () => {
  const [location] = useLocation();

  useEffect(() => {
    // Find the Layout's main scroll container
    const mainScrollContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    
    if (mainScrollContainer) {
      // Reset scroll position to top
      mainScrollContainer.scrollTop = 0;
    }
  }, [location]); // Trigger when route changes
};