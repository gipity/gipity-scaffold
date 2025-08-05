// Simple platform detection - let Capacitor handle this
import { debug } from './debug';
const isCapacitorAvailable = () => {
  try {
    return typeof window !== 'undefined' && !!(window as any).Capacitor;
  } catch {
    return false;
  }
};

const isNativePlatform = () => {
  return isCapacitorAvailable() && !!(window as any).Capacitor?.isNativePlatform?.();
};

// Dynamic Capacitor imports with simple platform detection
const loadCapacitorCore = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor;
  } catch (error) {
    debug.warn('Capacitor core not available:', error);
    return null;
  }
};

const loadStatusBar = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    return { StatusBar, Style };
  } catch (error) {
    debug.warn('StatusBar plugin not available:', error);
    return null;
  }
};

const loadSplashScreen = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { SplashScreen } = await import('@capacitor/splash-screen');
    return SplashScreen;
  } catch (error) {
    debug.warn('SplashScreen plugin not available:', error);
    return null;
  }
};

const loadApp = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { App } = await import('@capacitor/app');
    return App;
  } catch (error) {
    debug.warn('App plugin not available:', error);
    return null;
  }
};

const loadKeyboard = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { Keyboard } = await import('@capacitor/keyboard');
    return Keyboard;
  } catch (error) {
    debug.warn('Keyboard plugin not available:', error);
    return null;
  }
};

const loadSafeArea = async () => {
  try {
    if (!isNativePlatform()) return null;
    const { SafeArea, initialize } = await import('@capacitor-community/safe-area');
    return { SafeArea, initialize };
  } catch (error) {
    debug.warn('SafeArea plugin not available:', error);
    return null;
  }
};

// Clean mobile scaffold - core Capacitor functionality only
export const initializeCapacitor = async () => {
  debug.log('[Debug] initializeCapacitor() called');
  
  // Simple platform detection debug logging
  debug.log('=== PLATFORM DEBUG ===');
  debug.log('hostname:', window.location.hostname);
  debug.log('isCapacitorAvailable:', isCapacitorAvailable());
  debug.log('isNativePlatform:', isNativePlatform());
  debug.log('======================');
  
  if (!isNativePlatform()) {
    debug.log('[Debug] Web platform detected - skipping native plugin initialization');
    return;
  }

  try {
    const Capacitor = await loadCapacitorCore();
    
    if (Capacitor?.isNativePlatform()) {
      debug.log('[Debug] Native platform detected, initializing plugins');
      
      // Initialize StatusBar
      const statusBarModule = await loadStatusBar();
      if (statusBarModule) {
        try {
          await statusBarModule.StatusBar.setStyle({ style: statusBarModule.Style.Light });
          debug.log('[Debug] StatusBar initialized');
        } catch (error) {
          debug.warn('[Debug] StatusBar initialization failed:', error);
        }
      }

      // Initialize SplashScreen
      const SplashScreen = await loadSplashScreen();
      if (SplashScreen) {
        try {
          await SplashScreen.hide();
          debug.log('[Debug] SplashScreen hidden');
        } catch (error) {
          debug.warn('[Debug] SplashScreen hide failed:', error);
        }
      }

      // Initialize Keyboard
      const Keyboard = await loadKeyboard();
      if (Keyboard) {
        try {
          await Keyboard.setAccessoryBarVisible({ isVisible: false });
          debug.log('[Debug] Keyboard accessory bar hidden');
        } catch (error) {
          debug.warn('[Debug] Keyboard configuration failed:', error);
        }
      }

      // Initialize SafeArea plugin for proper safe area handling
      const safeAreaModule = await loadSafeArea();
      if (safeAreaModule) {
        try {
          // CRITICAL for Android: Initialize first to inject CSS variables
          if (safeAreaModule.initialize) {
            safeAreaModule.initialize();
            debug.log('[Debug] SafeArea CSS variables initialized');
          }
          
          // Enable with configuration (navigation bar colors removed)
          await safeAreaModule.SafeArea.enable({
            config: {
              customColorsForSystemBars: true,
              statusBarColor: '#f7fafc', // Match existing status bar color
              statusBarContent: 'dark',
            },
          });
          debug.log('[Debug] SafeArea plugin enabled with custom colors');
        } catch (error) {
          debug.warn('[Debug] SafeArea plugin initialization failed:', error);
        }
      }

      // Initialize App plugin for Android crash recovery
      const App = await loadApp();
      if (App) {
        try {
          // Listen for app restoration after potential camera crashes on Android 12/13
          App.addListener('appRestoredResult', (data: any) => {
            debug.log('[Debug] App restored after potential crash:', data);
            // Handle restored state if needed - this prevents Android camera crashes
            if (data && data.pluginId === 'Camera') {
              debug.log('[Debug] Camera operation restored after system restart');
            }
          });
          debug.log('[Debug] App crash recovery listener added');
        } catch (error) {
          debug.warn('[Debug] App plugin configuration failed:', error);
        }
      }
      
      debug.log('[Debug] Capacitor plugins initialized');
    } else {
      debug.log('[Debug] Not native platform, skipping native configuration');
    }
  } catch (error) {
    debug.error('[Debug] Error during Capacitor initialization:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    debug.error('[Debug] Error details:', errorMessage, errorStack);
  }
  
  debug.log('[Debug] initializeCapacitor() completed');
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  const info = {
    platform: isCapacitorAvailable() ? ((window as any).Capacitor.getPlatform?.() || 'unknown') : 'web',
    isNative: isNativePlatform(),
    isCapacitorAvailable: isCapacitorAvailable(),
    isPWASupported: 'serviceWorker' in navigator,
    isServiceWorkerSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isDevelopment: import.meta.env.DEV,
    isReplit: typeof window !== 'undefined' && window.location.hostname.includes('replit'),
    forceWebMode: !isNativePlatform(), // Simple: not native = web mode
  };
  
  // Enhanced environment logging
  debug.log('=== ENVIRONMENT INFO DETAILED ===');
  debug.log('🌍 BASIC ENVIRONMENT:');
  debug.log('  Platform:', info.platform);
  debug.log('  Is Native:', info.isNative);
  debug.log('  Is Development:', info.isDevelopment);
  debug.log('  Is Replit:', info.isReplit);
  
  debug.log('🔌 CAPACITOR STATUS:');
  debug.log('  Capacitor Available:', info.isCapacitorAvailable);
  debug.log('  Native Platform:', info.isNative);
  debug.log('  Force Web Mode:', info.forceWebMode);
  
  debug.log('📱 WEB CAPABILITIES:');
  debug.log('  PWA Supported:', info.isPWASupported);
  debug.log('  Service Worker Supported:', info.isServiceWorkerSupported);
  
  debug.log('🔧 TECHNICAL DETAILS:');
  debug.log('  User Agent:', navigator.userAgent.substring(0, 100) + '...');
  debug.log('  Hostname:', window.location.hostname);
  debug.log('  Protocol:', window.location.protocol);
  debug.log('  Window Capacitor:', !!(window as any).Capacitor);
  debug.log('  Window Camera:', !!(window as any).Camera);
  
  debug.log('📊 IMPORT META ENV:');
  debug.log('  NODE_ENV:', import.meta.env.NODE_ENV);
  debug.log('  DEV:', import.meta.env.DEV);
  debug.log('  PROD:', import.meta.env.PROD);
  debug.log('  BASE_URL:', import.meta.env.BASE_URL);
  debug.log('  VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  debug.log('  VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);
  
  debug.log('================================');
  
  return info;
};

// Helper functions for compatibility
export const getPlatform = () => {
  if (!isCapacitorAvailable()) return 'web';
  return (window as any).Capacitor?.getPlatform?.() || 'web';
};

// Export for debugging purposes and compatibility
export { isCapacitorAvailable, isNativePlatform };