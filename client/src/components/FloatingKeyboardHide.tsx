import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard, ChevronDown } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { usePlatform } from '@/hooks/use-platform';
import { debug } from '../lib/debug';

interface KeyboardInfo {
  keyboardHeight: number;
}

interface FloatingKeyboardHideProps {
  show?: boolean;
}

export default function FloatingKeyboardHide({ show = true }: FloatingKeyboardHideProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { appContext } = usePlatform();

  useEffect(() => {
    let removeKeyboardListeners: (() => void) | null = null;

    const setupKeyboardListeners = async () => {
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - detect virtual keyboard using viewport changes
        const handleResize = () => {
          const viewportHeight = window.visualViewport?.height || window.innerHeight;
          const windowHeight = window.screen.height;
          const keyboardVisible = viewportHeight < windowHeight * 0.75;
          
          setIsKeyboardVisible(keyboardVisible);
          setKeyboardHeight(keyboardVisible ? windowHeight - viewportHeight : 0);
        };

        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', handleResize);
          removeKeyboardListeners = () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
          };
        }
        return;
      }

      try {
        const { Keyboard } = await import('@capacitor/keyboard');
        
        const keyboardWillShow = await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
          debug.log('[FloatingKeyboardHide] Keyboard will show, height:', info.keyboardHeight);
          setIsKeyboardVisible(true);
          setKeyboardHeight(info.keyboardHeight);
        });

        const keyboardWillHide = await Keyboard.addListener('keyboardWillHide', () => {
          debug.log('[FloatingKeyboardHide] Keyboard will hide');
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        });

        removeKeyboardListeners = () => {
          keyboardWillShow.remove();
          keyboardWillHide.remove();
        };

      } catch (error) {
        debug.warn('[FloatingKeyboardHide] Keyboard plugin not available:', error);
      }
    };

    setupKeyboardListeners();

    return () => {
      if (removeKeyboardListeners) {
        removeKeyboardListeners();
      }
    };
  }, []);

  const getActualKeyboardHeight = (keyboardHeight: number) => {
    if (!Capacitor.isNativePlatform()) return 0;
    
    if (appContext === 'native-android') {
      // Android reports keyboard height + navigation bar height
      // Calculate actual keyboard height by subtracting navigation bar
      const navBarHeight = window.screen.height - window.innerHeight;
      return Math.max(0, keyboardHeight - navBarHeight);
    }
    return keyboardHeight; // iOS reports correct height
  };

  const handleHideKeyboard = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - blur active element
      if (document.activeElement && 'blur' in document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      return;
    }

    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      await Keyboard.hide();
      debug.log('[FloatingKeyboardHide] Keyboard hidden');
    } catch (error) {
      debug.warn('[FloatingKeyboardHide] Failed to hide keyboard:', error);
    }
  };

  if (!show || !isKeyboardVisible || appContext !== 'native-ios') {
    return null;
  }

  const actualKeyboardHeight = getActualKeyboardHeight(keyboardHeight);

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        right: '24px', // Moved slightly left from right-4 (16px) to 24px
        bottom: Capacitor.isNativePlatform() 
          ? `${actualKeyboardHeight + 16}px` // 16px above keyboard edge for both platforms
          : '80px' // Web fallback position
      }}
    >
      <Button
        onClick={handleHideKeyboard}
        size="sm"
        variant="secondary"
        className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-all duration-200 rounded-full w-12 h-12 p-0 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <Keyboard className="w-4 h-4 text-gray-700" />
          <ChevronDown className="w-3 h-3 text-gray-700 -mt-1" />
        </div>
        <span className="sr-only">Hide keyboard</span>
      </Button>
    </div>
  );
}