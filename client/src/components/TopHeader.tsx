import { useState } from 'react';
import { Settings, LogOut, Terminal, User, Shield } from '@/lib/icons';
import { debug } from '@/lib/debug';
import { Button } from '@/components/ui/button';
import logoImage from '../assets/logo.png';
import logo2x from '../assets/logo@2x.png';
import logo3x from '../assets/logo@3x.png';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DebugConsole from './DebugConsole';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../lib/auth-context';
import { useLocation } from 'wouter';

export default function TopHeader() {
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if debug console should be shown (controlled by environment variable)
  const isDebugConsoleEnabled = import.meta.env.VITE_SHOW_DEBUG_CONSOLE === 'true';

  const handleLogout = () => {
    debug.log('Logout button clicked');
    logout();
    setLocation('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 safe-top">
      
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setLocation('/')}
        >
          <img 
            src={logoImage} 
            srcSet={`${logoImage} 1x, ${logo2x} 2x, ${logo3x} 3x`}
            alt="App Logo" 
            className="h-8"
          />
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-3 relative">
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Settings className="text-gray-600 w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user && (
                <DropdownMenuItem 
                  disabled={true}
                  className="text-sm font-medium text-gray-700 mb-2"
                >
                  {user.email}
                </DropdownMenuItem>
              )}
              {user && (
                <DropdownMenuItem 
                  onClick={() => setLocation('/profile')}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>User Profile</span>
                </DropdownMenuItem>
              )}
              {user && user.user_type === 'admin' && (
                <DropdownMenuItem 
                  onClick={() => setLocation('/admin-dashboard')}
                  className="flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              )}
              {isDebugConsoleEnabled && (
                <DropdownMenuItem 
                  onClick={() => setShowDebug(true)}
                  className="flex items-center space-x-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Debug Console</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Debug Console - only render if enabled */}
      {isDebugConsoleEnabled && (
        <DebugConsole isOpen={showDebug} onToggle={() => setShowDebug(!showDebug)} />
      )}
    </header>
  );
}