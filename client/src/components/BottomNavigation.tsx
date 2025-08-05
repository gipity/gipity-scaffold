import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Library } from '@/lib/icons';
import { Calendar, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { usePlatform } from '@/hooks/use-platform';
import { debug } from '@/lib/debug';



export default function BottomNavigation() {
  const [location] = useLocation();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { isAndroidDevice } = usePlatform();

  useEffect(() => {

    // Setup keyboard listeners for bottom navigation immunity
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const setupKeyboardListeners = async () => {
      try {
        const { Keyboard } = await import('@capacitor/keyboard');
        
        const keyboardWillShow = await Keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
          setIsKeyboardVisible(true);
          setKeyboardHeight(info.keyboardHeight);
        });

        const keyboardWillHide = await Keyboard.addListener('keyboardWillHide', () => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        });

        return () => {
          keyboardWillShow.remove();
          keyboardWillHide.remove();
        };
      } catch (error) {
        debug.warn('[BottomNavigation] Keyboard plugin not available:', error);
      }
    };

    const cleanup = setupKeyboardListeners();
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [isAndroidDevice]);

  const getActualKeyboardHeight = (keyboardHeight: number) => {
    if (isAndroidDevice && keyboardHeight > 0) {
      // Android reports keyboard height + navigation bar height
      // Calculate actual keyboard height by subtracting navigation bar
      const navBarHeight = window.screen.height - window.innerHeight;
      return Math.max(0, keyboardHeight - navBarHeight);
    }
    return keyboardHeight; // iOS reports correct height
  };

  const actualKeyboardHeight = getActualKeyboardHeight(keyboardHeight);

  return (
    <div 
      data-bottom-nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="px-4 py-2" style={{ paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))' }}>
        <div className="grid grid-cols-4 gap-1">
          {/* Home */}
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
              location === '/' 
                ? 'bg-[#476A92]/10 dark:bg-[#476A92]/20 text-[#476A92] dark:text-[#476A92]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>

          {/* Notes */}
          <Link 
            href="/notes" 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
              location === '/notes' 
                ? 'bg-[#476A92]/10 dark:bg-[#476A92]/20 text-[#476A92] dark:text-[#476A92]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Calendar size={20} />
            <span className="text-xs mt-1 font-medium">Notes</span>
          </Link>

          {/* About */}
          <Link 
            href="/about" 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
              location === '/about' 
                ? 'bg-[#476A92]/10 dark:bg-[#476A92]/20 text-[#476A92] dark:text-[#476A92]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Library size={20} />
            <span className="text-xs mt-1 font-medium">About</span>
          </Link>

          {/* Help */}
          <Link 
            href="/help" 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
              location === '/help' 
                ? 'bg-[#476A92]/10 dark:bg-[#476A92]/20 text-[#476A92] dark:text-[#476A92]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Info size={20} />
            <span className="text-xs mt-1 font-medium">Help</span>
          </Link>
        </div>
      </div>
    </div>
  );
}