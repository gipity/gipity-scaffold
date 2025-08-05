import React from 'react';
import { useAuth } from '../lib/auth-context';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading only while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null to prevent flash of content
  // useEffect will handle redirect to login
  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};