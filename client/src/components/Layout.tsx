import { ReactNode, useEffect } from 'react';
import TopHeader from './TopHeader';
import BottomNavigation from './BottomNavigation';
import DebugConsole from './DebugConsole';
import { usePlatform } from '../hooks/use-platform';
import { useContentPadding } from '../hooks/use-content-padding';
import { useScrollReset } from '../hooks/use-scroll-reset';
import { Capacitor } from '@capacitor/core';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isNativeApp, isPWA, isWebBrowser, isAndroidDevice, appContext, deviceOS, isIOSDevice, isMobileDevice, browser, userAgent, capacitorPlatform } = usePlatform();
  const { padding: bottomClearance, hasCalculated } = useContentPadding(); // Use measurement-based hook
  
  // Reset scroll position when navigating between routes
  useScrollReset();

  // Debug logging - run once when component mounts and padding is available
  useEffect(() => {
    // Only log when the hook has actually calculated a value
    if (import.meta.env.VITE_DO_CONSOLE_LOGGING === 'true' && hasCalculated) {
      console.log('[Layout Debug]', {
        // Layout calculations
        padding: bottomClearance,
        navFound: !!document.querySelector('[data-bottom-nav]'),
        
        // Screen dimensions
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        
        // App context (mutually exclusive)
        appContext: appContext,
        isNativeApp: isNativeApp,
        isPWA: isPWA,
        isWebBrowser: isWebBrowser,
        
        // Device OS detection
        deviceOS: deviceOS,
        isIOSDevice: isIOSDevice,
        isAndroidDevice: isAndroidDevice,
        isMobileDevice: isMobileDevice,
        
        // Browser detection
        browser: browser,
        
        // Capacitor info
        capacitorPlatform: capacitorPlatform,
        
        // Device capabilities
        hasTouch: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints,
        
        // User agent (longer snippet)
        userAgent: userAgent.substring(0, 200) + (userAgent.length > 200 ? '...' : '')
      });
    }
  }, [bottomClearance]); // Only run when padding value changes

  // Setup navigation bar if Android (separate effect)
  useEffect(() => {
    if (isAndroidDevice && Capacitor.isNativePlatform()) {
      import('../lib/navigation-bar').then(({ initializeNavigationBar }) => {
        initializeNavigationBar();
      }).catch(error => {
        console.warn('[Layout] Failed to initialize navigation bar:', error);
      });
    }
  }, [isAndroidDevice]);

  return (
    <div 
      className="relative w-full flex flex-col mobile-optimized"
      style={{ height: '100%', minHeight: '100%' }}
    >
      <TopHeader />
      
      <main 
        className="flex-1 overflow-y-auto mobile-main-content" 
        style={{ 
          paddingTop: 'calc(4rem + var(--safe-area-inset-top, 0px))', // Header height + safe area
          paddingBottom: `${bottomClearance}px`
        }}
      >
        {children}
      </main>
      
      <BottomNavigation />
      {/* Only render DebugConsole if enabled */}
      {import.meta.env.VITE_SHOW_DEBUG_CONSOLE === 'true' && <DebugConsole />}
    </div>
  );
}