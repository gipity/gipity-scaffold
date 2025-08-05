import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PlatformInfo {
  // Primary app context (mutually exclusive)
  appContext: 'native-ios' | 'native-android' | 'web-browser' | 'pwa';
  isNativeApp: boolean;    // true for native-ios/native-android
  isPWA: boolean;          // true only for pwa
  isWebBrowser: boolean;   // true only for web-browser
  
  // Device OS (secondary detection)
  deviceOS: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  isIOSDevice: boolean;
  isAndroidDevice: boolean;
  isMobileDevice: boolean;
  
  // Browser (when web app)
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'unknown';
  
  // Raw data
  userAgent: string;
  capacitorPlatform: string;
}

/**
 * Hook to detect platform with mutually exclusive app contexts and clear device detection
 */
export function usePlatform(): PlatformInfo {
  // Initialize with actual detection results, not defaults
  const [platform, setPlatform] = useState<PlatformInfo>(() => {
    const userAgent = navigator.userAgent;
    const capacitorPlatform = Capacitor.getPlatform();
    
    // Detect mobile using multiple methods for reliability
    const isMobileDevice = (() => {
      // Check if it's a touch device
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check viewport width (mobile devices typically < 768px)
      const isMobileWidth = window.innerWidth <= 768;
      
      // Check for mobile user agent patterns
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
      const hasMobileUA = mobileRegex.test(userAgent);
      
      // Check for mobile vendor
      const mobileVendor = /Apple|Google Inc/i.test(navigator.vendor || '');
      
      return hasTouch && (hasMobileUA || isMobileWidth || mobileVendor);
    })();
    
    // Device OS Detection (regardless of app type)
    const isAndroidDevice = /Android/i.test(userAgent) || 
                           /Linux.*Android/i.test(navigator.platform || '') ||
                           (/Linux/i.test(navigator.platform || '') && isMobileDevice && !/iPhone|iPad|iPod/i.test(userAgent));
    
    const isIOSDevice = (() => {
      // Standard iOS detection
      if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
      
      // iPad on iOS 13+ (reports as Mac)
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) return true;
      
      // iOS vendor check
      if (/Apple/i.test(navigator.vendor || '') && isMobileDevice) {
        // Additional check to exclude Mac desktops
        if (!/Mac OS X/.test(userAgent) || navigator.maxTouchPoints > 0) return true;
      }
      
      // Fallback: mobile device that's not Android
      if (isMobileDevice && !isAndroidDevice) {
        // Check for iOS-specific features
        const isWebkit = 'WebkitAppearance' in document.documentElement.style;
        const hasSafariUA = /Safari/i.test(userAgent) && !/Chrome|CriOS|OPR/i.test(userAgent);
        if (isWebkit || hasSafariUA) return true;
      }
      
      return false;
    })();
    
    // Determine device OS
    const deviceOS = (() => {
      if (isIOSDevice) return 'ios';
      if (isAndroidDevice) return 'android';
      if (/Win/i.test(navigator.platform || '')) return 'windows';
      if (/Mac/i.test(navigator.platform || '') || /Mac OS X/i.test(userAgent)) return 'macos';
      if (/Linux/i.test(navigator.platform || '')) return 'linux';
      return 'unknown';
    })() as 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    
    // Browser Detection (for web apps) - iOS/Android aware
    const browser = (() => {
      // iOS-specific browser detection (all use WebKit but have different identifiers)
      if (/CriOS/i.test(userAgent)) return 'chrome';        // Chrome on iOS
      if (/FxiOS/i.test(userAgent)) return 'firefox';       // Firefox on iOS
      if (/EdgiOS/i.test(userAgent)) return 'edge';         // Edge on iOS
      
      // General browser detection (works for desktop + Android)
      if (/Edge|Edg/i.test(userAgent)) return 'edge';       // Edge (desktop + Android)
      if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) return 'chrome'; // Chrome (desktop + Android)
      if (/Firefox/i.test(userAgent)) return 'firefox';     // Firefox (desktop + Android)
      if (/SamsungBrowser/i.test(userAgent)) return 'samsung'; // Samsung Internet (Android)
      
      // Safari detection (after iOS Chrome/Firefox ruled out)
      if (/Safari/i.test(userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(userAgent)) return 'safari';
      
      return 'unknown';
    })() as 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'unknown';
    
    // PWA Detection
    const isPWADetected = window.matchMedia('(display-mode: standalone)').matches ||
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         (window.navigator as any).standalone === true || // iOS Safari
                         document.referrer.includes('android-app://'); // Android TWA
    
    // Primary App Context (mutually exclusive)
    const appContext = (() => {
      if (capacitorPlatform === 'ios') return 'native-ios';
      if (capacitorPlatform === 'android') return 'native-android';
      if (capacitorPlatform === 'web' && isPWADetected) return 'pwa';
      return 'web-browser';
    })() as 'native-ios' | 'native-android' | 'web-browser' | 'pwa';
    
    // Derived booleans (mutually exclusive)
    const isNativeApp = appContext === 'native-ios' || appContext === 'native-android';
    const isPWA = appContext === 'pwa';
    const isWebBrowser = appContext === 'web-browser';

    // Return the complete platform info
    return {
      // Primary app context (mutually exclusive)
      appContext,
      isNativeApp,
      isPWA,
      isWebBrowser,
      
      // Device OS (secondary detection)
      deviceOS,
      isIOSDevice,
      isAndroidDevice,
      isMobileDevice,
      
      // Browser (when web app)
      browser,
      
      // Raw data
      userAgent,
      capacitorPlatform
    };
  });

  return platform;
}