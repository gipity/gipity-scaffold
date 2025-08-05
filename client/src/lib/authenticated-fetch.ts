import { getApiUrl } from './api';

export interface AuthenticatedFetchOptions extends RequestInit {
  token?: string; // Optional override token
  skipAuth?: boolean; // Skip auth for public endpoints
}

export interface AuthenticatedResponse<T = any> extends Response {
  isAuthError?: boolean;
  data?: T;
}

/**
 * Centralized authenticated fetch wrapper that automatically:
 * - Injects Authorization header from localStorage
 * - Detects 401 responses and triggers logout
 * - Returns enhanced response with isAuthError flag
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {},
  onTokenExpiration?: () => void
): Promise<AuthenticatedResponse> {
  const { token, skipAuth, ...fetchOptions } = options;
  
  // Always get token from localStorage (single source of truth for cross-platform compatibility)
  const authToken = skipAuth ? null : localStorage.getItem('app_token');
  
  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  if (authToken && !skipAuth) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  // Make the request
  const response = await fetch(getApiUrl(url), {
    ...fetchOptions,
    headers
  }) as AuthenticatedResponse;
  
  // Check for 401 and trigger logout if handler provided
  if (response.status === 401 && onTokenExpiration) {
    response.isAuthError = true;
    onTokenExpiration();
  } else if (response.status === 401) {
    response.isAuthError = true;
  }
  
  return response;
}

/**
 * Helper function that returns standard API response format with isAuthError
 */
export async function getAuthenticatedApiResponse<T>(
  response: AuthenticatedResponse,
  defaultError: string = 'Request failed'
): Promise<{ success: boolean; data?: T; error?: string; isAuthError?: boolean }> {
  if (response.isAuthError) {
    return { success: false, error: 'Session expired', isAuthError: true };
  }
  
  try {
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data, ...data };
    } else {
      return { success: false, error: data.error || defaultError };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}