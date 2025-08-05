import { UserRegistration, UserLogin, User, Note, CreateNote, UpdateNote } from "../../../shared/schema";
import { authenticatedFetch, getAuthenticatedApiResponse } from './authenticated-fetch';

// Get full API URL based on environment
export const getApiUrl = (endpoint: string) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  return `${baseUrl}${endpoint}`;
};

// Authentication API functions
export const authApi = {
  register: async (userData: UserRegistration): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  login: async (credentials: UserLogin): Promise<{ success: boolean; token?: string; user?: any; error?: string }> => {
    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getMe: async (token: string, onTokenExpiration?: () => void): Promise<{ success: boolean; user?: User; error?: string; isAuthError?: boolean }> => {
    try {
      const response = await authenticatedFetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
      }, onTokenExpiration);

      return await getAuthenticatedApiResponse<User>(response, 'Failed to get user');
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  confirm: async (confirmData: { access_token: string; type: string }): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await fetch(getApiUrl('/api/auth/confirm'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};

// Note API functions (requires authentication)
export const noteApi = {
  create: async (token: string, noteData: CreateNote, onTokenExpiration?: () => void): Promise<{ success: boolean; note?: Note; error?: string; isAuthError?: boolean }> => {
    try {
      const response = await authenticatedFetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
        token,
      }, onTokenExpiration);

      return await getAuthenticatedApiResponse<Note>(response, 'Failed to create note');
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getAll: async (token: string, onTokenExpiration?: () => void): Promise<{ success: boolean; notes?: Note[]; error?: string; isAuthError?: boolean }> => {
    try {
      const response = await authenticatedFetch('/api/notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
      }, onTokenExpiration);

      return await getAuthenticatedApiResponse<Note[]>(response, 'Failed to get notes');
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  update: async (token: string, noteId: string, updates: UpdateNote, onTokenExpiration?: () => void): Promise<{ success: boolean; note?: Note; error?: string; isAuthError?: boolean }> => {
    try {
      const response = await authenticatedFetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        token,
      }, onTokenExpiration);

      return await getAuthenticatedApiResponse<Note>(response, 'Failed to update note');
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  delete: async (token: string, noteId: string, onTokenExpiration?: () => void): Promise<{ success: boolean; error?: string; isAuthError?: boolean }> => {
    try {
      const response = await authenticatedFetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
      }, onTokenExpiration);

      return await getAuthenticatedApiResponse(response, 'Failed to delete note');
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};