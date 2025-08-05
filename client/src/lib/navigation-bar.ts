import { Capacitor } from '@capacitor/core';
import { debug } from './debug';

// Dynamic import to avoid loading on web
let NavigationBar: any;

export async function initializeNavigationBar() {
  // Only initialize on Android
  if (Capacitor.getPlatform() !== 'android') {
    debug.log('[NavigationBar] Skipping - not Android platform');
    return;
  }

  try {
    // Import the plugin using official API
    const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
    
    // Set navigation bar to white with dark buttons (working configuration)
    await NavigationBar.setNavigationBarColor({
      color: '#FFFFFF',
      darkButtons: true // Dark buttons for white background
    });
    
    debug.log('[NavigationBar] Successfully set color to #FFFFFF with dark buttons');
  } catch (error) {
    debug.warn('[NavigationBar] Failed to initialize:', error);
  }
}

// Export function to change navigation bar color dynamically if needed
export async function setNavigationBarColorDynamic(color: string, darkButtons: boolean = false) {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }
  
  try {
    const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
    await NavigationBar.setNavigationBarColor({
      color,
      darkButtons
    });
  } catch (error) {
    debug.warn('[NavigationBar] Failed to set color:', error);
  }
}