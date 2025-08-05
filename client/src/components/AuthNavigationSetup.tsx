import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth-context';

/**
 * Sets up the navigation callback for auth context to use client-side navigation
 * instead of full page reloads when redirecting to login after token expiration
 */
export const AuthNavigationSetup: React.FC = () => {
  const [, setLocation] = useLocation();
  const { setNavigationCallback } = useAuth();

  useEffect(() => {
    // Set up the navigation callback to use wouter's client-side navigation
    setNavigationCallback(() => () => {
      setLocation('/login');
    });

    // Cleanup on unmount
    return () => {
      setNavigationCallback(null);
    };
  }, [setLocation, setNavigationCallback]);

  return null; // This component doesn't render anything
};