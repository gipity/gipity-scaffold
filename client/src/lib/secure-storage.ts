import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Preferences } from '@capacitor/preferences';
import { debug } from './debug';

// Type declarations for Web Credential Management API
declare global {
  interface Window {
    PasswordCredential: typeof PasswordCredential;
  }
}

interface PasswordCredential extends Credential {
  readonly password: string | null;
  readonly name: string;
}

interface PasswordCredentialConstructor {
  new(data: PasswordCredentialData): PasswordCredential;
  prototype: PasswordCredential;
}

interface PasswordCredentialData {
  id: string;
  password: string;
  name?: string;
  iconURL?: string;
}

declare const PasswordCredential: PasswordCredentialConstructor;

/**
 * Secure storage adapter that uses appropriate storage mechanism based on platform:
 * - Native mobile: Uses iOS Keychain / Android Keystore via @aparajita/capacitor-secure-storage
 * - Web: Uses browser's credential management API or sessionStorage fallback
 */
export class SecureStorageAdapter {
  private static instance: SecureStorageAdapter;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): SecureStorageAdapter {
    if (!SecureStorageAdapter.instance) {
      SecureStorageAdapter.instance = new SecureStorageAdapter();
    }
    return SecureStorageAdapter.instance;
  }

  /**
   * Store credentials securely
   */
  async setCredentials(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    if (!rememberMe) {
      // If not remembering, clear any existing credentials
      await this.clearCredentials();
      return;
    }

    if (this.isNative) {
      // Native platforms: Use secure storage (iOS Keychain / Android Keystore)
      try {
        await SecureStorage.set('user_email', email);
        await SecureStorage.set('user_password', password);
        await SecureStorage.set('remember_credentials', 'true');
        debug.log('[SecureStorage] Credentials stored securely in native storage');
      } catch (error) {
        debug.error('[SecureStorage] Failed to store credentials in native storage:', error);
        // Fallback to preferences for email only (not password)
        await Preferences.set({ key: 'user_email', value: email });
        await Preferences.set({ key: 'remember_credentials', value: 'email_only' });
      }
    } else {
      // Web platform: Use browser's credential management if available
      try {
        if ('credentials' in navigator && 'PasswordCredential' in window) {
          const credential = new PasswordCredential({
            id: email,
            password: password,
            name: email
          });
          await navigator.credentials.store(credential);
          debug.log('[SecureStorage] Credentials stored in browser credential manager');
        } else {
          // Fallback: Store email only in sessionStorage, let browser handle password
          sessionStorage.setItem('user_email', email);
          sessionStorage.setItem('remember_credentials', 'email_only');
          debug.log('[SecureStorage] Email stored in sessionStorage for web platform');
        }
      } catch (error) {
        // Only log in production - Replit dev environment always fails due to sandbox restrictions
        if (import.meta.env.PROD) {
          debug.error('[SecureStorage] Failed to store credentials in browser:', error);
        }
        // Final fallback: Store email only
        sessionStorage.setItem('user_email', email);
        sessionStorage.setItem('remember_credentials', 'email_only');
      }
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getCredentials(): Promise<{ email: string | null; password: string | null; rememberMe: boolean }> {
    if (this.isNative) {
      // Native platforms: Try to get from secure storage
      try {
        const rememberFlag = await SecureStorage.get('remember_credentials');
        if (rememberFlag === 'true') {
          const email = await SecureStorage.get('user_email');
          const password = await SecureStorage.get('user_password');
          return {
            email: typeof email === 'string' ? email : null,
            password: typeof password === 'string' ? password : null,
            rememberMe: true
          };
        }
      } catch (error) {
        debug.log('[SecureStorage] No credentials found in native storage or error occurred:', error);
      }

      // Fallback to preferences for email only
      try {
        const { value: rememberFlag } = await Preferences.get({ key: 'remember_credentials' });
        if (rememberFlag === 'email_only') {
          const { value: email } = await Preferences.get({ key: 'user_email' });
          return {
            email: email || null,
            password: null,
            rememberMe: false
          };
        }
      } catch (error) {
        debug.log('[SecureStorage] No credentials found in preferences:', error);
      }
    } else {
      // Web platform: Try to get from browser's credential management
      try {
        if ('credentials' in navigator) {
          const credential = await navigator.credentials.get({
            password: true,
            mediation: 'silent'
          } as CredentialRequestOptions);
          
          if (credential && credential.type === 'password') {
            const passwordCredential = credential as PasswordCredential;
            return {
              email: passwordCredential.id,
              password: passwordCredential.password || null,
              rememberMe: true
            };
          }
        }
      } catch (error) {
        debug.log('[SecureStorage] No credentials found in browser credential manager:', error);
      }

      // Fallback: Get email from sessionStorage
      const email = sessionStorage.getItem('user_email');
      const rememberFlag = sessionStorage.getItem('remember_credentials');
      
      return {
        email: email || null,
        password: null, // Never store passwords in sessionStorage
        rememberMe: rememberFlag === 'email_only'
      };
    }

    return { email: null, password: null, rememberMe: false };
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    if (this.isNative) {
      // Native platforms: Clear from secure storage
      try {
        await SecureStorage.remove('user_email');
        await SecureStorage.remove('user_password');
        await SecureStorage.remove('remember_credentials');
        debug.log('[SecureStorage] Credentials cleared from native storage');
      } catch (error) {
        debug.log('[SecureStorage] Error clearing native storage (may not exist):', error);
      }

      // Also clear from preferences fallback
      try {
        await Preferences.remove({ key: 'user_email' });
        await Preferences.remove({ key: 'remember_credentials' });
      } catch (error) {
        debug.log('[SecureStorage] Error clearing preferences fallback:', error);
      }
    } else {
      // Web platform: Clear from sessionStorage
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('remember_credentials');
      debug.log('[SecureStorage] Credentials cleared from web storage');
    }
  }

  /**
   * Check if credentials are remembered
   */
  async hasRememberedCredentials(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return credentials.email !== null;
  }
}

// Export singleton instance
export const secureStorage = SecureStorageAdapter.getInstance();