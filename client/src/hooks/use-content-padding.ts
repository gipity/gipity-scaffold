import { useState, useLayoutEffect, useRef } from "react";
import { usePlatform } from "./use-platform";

/**
 * Hook for calculating content bottom padding based on real-world device measurements
 * Provides scaffold users with accurate padding for content areas above bottom navigation
 */
export function useContentPadding() {
  const platform = usePlatform();
  const [contentPadding, setContentPadding] = useState(80); // Conservative default
  const hasCalculated = useRef(false);

  useLayoutEffect(() => {
    const calculatePadding = () => {
      // Platform-specific adjustments based on real-world measurements
      const PADDING_ADJUSTMENTS: Record<string, number> = {
        // iOS
        "ios-web-safari": 25,       //LOCKED
        "ios-web-chrome": 70,       //LOCKED
        "ios-web-edge": -30,        //LOCKED
        "ios-pwa": 30,              //LOCKED
        "ios-native": 0,            //LOCKED

        // Android
        "android-web-edge": 110,    //LOCKED
        "android-web-chrome": 50,   //LOCKED
        "android-pwa": 0,           //LOCKED
        "android-native": 0,        //LOCKED

        // Desktop
        "windows-web-chrome": -150, //LOCKED
        "windows-web-firefox": -150,//LOCKED
        "windows-web-edge": -150,   //LOCKED
        "macos-web-chrome": -150,   //not tested
        "macos-web-safari": -150,   //not tested
        "macos-web-firefox": -150,  //not tested
        "macos-web-edge": -150,     //not tested
        "linux-web-chrome": -150,   //not tested
        "linux-web-firefox": -150,  //not tested
        "linux-web-edge": -150,     //not tested

        // Desktop PWA
        "windows-pwa": -30,         //not tested
        "macos-pwa": -30,           //not tested
        "linux-pwa": -30,           //not tested

        fallback: 0,                //not tested
      };

      const navElement = document.querySelector("[data-bottom-nav]");

      // Get current viewport and document measurements
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const documentHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Calculate base values from different measurement approaches
      const measurements = [];

      // Navigation-based measurement (when available)
      if (navElement) {
        const navRect = navElement.getBoundingClientRect();
        measurements.push(navRect.height * 1.3);
      }

      // Viewport-based measurements for different screen contexts
      measurements.push(vh * 0.1); // 10% of viewport height
      measurements.push(vw * 0.12); // 12% of viewport width (for landscape)
      measurements.push(80); // Absolute minimum for any context

      // Browser UI detection - difference between client and viewport
      const uiConsumption = Math.abs(clientHeight - vh);
      if (uiConsumption > 0) {
        measurements.push(uiConsumption * 1.2);
      }

      // Screen density adjustment
      const pixelRatio = window.devicePixelRatio || 1;
      const densityAdjustment = Math.max(60, 40 * pixelRatio);
      measurements.push(densityAdjustment);

      // Get the maximum of all measurements as base
      const basePadding = Math.ceil(Math.max(...measurements));

      // Apply platform-specific adjustments
      const deviceKey = platform.deviceOS;
      const contextKey = platform.appContext;
      const browserKey = platform.browser;

      const contextMap: Record<string, string> = {
        "native-ios": "native",
        "native-android": "native",
        pwa: "pwa",
        "web-browser": "web",
      };

      const simplifiedContext = contextMap[contextKey] || "web";

      // Try specific key first, then general key, then fallback
      const specificKey = `${deviceKey}-${simplifiedContext}-${browserKey}`;
      const generalKey = `${deviceKey}-${simplifiedContext}`;

      const adjustment =
        PADDING_ADJUSTMENTS[specificKey] ??
        PADDING_ADJUSTMENTS[generalKey] ??
        PADDING_ADJUSTMENTS["fallback"];

      // Apply adjustment to base padding
      const finalPadding = basePadding + adjustment;

      // Ensure we never go below a minimum threshold
      return Math.max(20, finalPadding);
    };

    // Force recalculation for testing
    // if (hasCalculated.current) return;

    // Calculate initial padding
    const padding = calculatePadding();
    setContentPadding(padding);
    hasCalculated.current = true;

    // Recalculate on resize or orientation change
    const handleResize = () => {
      const newPadding = calculatePadding();
      setContentPadding(newPadding);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [platform.deviceOS, platform.appContext, platform.browser]);

  return { padding: contentPadding, hasCalculated: hasCalculated.current };
}
