// API Configuration for different environments
import { debug } from './debug';

export const getApiBaseUrl = (): string => {
  // Use VITE_BACKEND_URL if set (from Appflow or other deployment)
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Debug logging for mobile environment
  debug.log('Environment debug:', {
    VITE_BACKEND_URL: backendUrl,
    protocol: window.location.protocol,
    userAgent: window.navigator?.userAgent,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  });
  
  if (backendUrl) {
    debug.log('Using backend URL from environment:', backendUrl);
    return backendUrl;
  }
  
  debug.log('No VITE_BACKEND_URL found, using relative URLs');
  // Default to relative URLs for local development
  return '';
};

export const getFullApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
};