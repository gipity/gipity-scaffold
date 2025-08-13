import { useState } from 'react';
import { Settings, LogOut, Terminal, User, Shield } from '@/lib/icons';
import { Menu, X, Home as HomeIcon } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if debug console should be shown (controlled by environment variable)
  const isDebugConsoleEnabled = import.meta.env.VITE_SHOW_DEBUG_CONSOLE === 'true';

  const handleNotesClick = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      setLocation('/login');
    } else {
      setLocation('/notes');
    }
  };

  const handleLogout = () => {
    debug.log('Logout button clicked');
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    setLocation('/');
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
          {isAuthenticated() ? (
            /* Authenticated user: Home button + Settings dropdown */
            <>
              {/* Desktop: Show Home button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="hidden md:inline-flex text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
              >
                Home
              </Button>

              {/* Mobile: Show hamburger menu */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  {showMobileMenu ? (
                    <X className="text-gray-600 w-5 h-5" />
                  ) : (
                    <Menu className="text-gray-600 w-5 h-5" />
                  )}
                </Button>
              </div>
              
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
            </>
          ) : (
            /* Not authenticated: Public navigation */
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/')}
                  className="text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                >
                  Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotesClick}
                  className="text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                >
                  Demo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/about')}
                  className="text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                >
                  About
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/help')}
                  className="text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                >
                  Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/login')}
                  className="border-[#476A92] text-[#476A92] hover:bg-[#476A92] hover:text-white transition-colors"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation('/signup')}
                  className="bg-[#476A92] hover:bg-[#3d5c82] text-white transition-colors"
                >
                  Sign Up
                </Button>
              </div>

              {/* Mobile Hamburger Menu */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  {showMobileMenu ? (
                    <X className="text-gray-600 w-5 h-5" />
                  ) : (
                    <Menu className="text-gray-600 w-5 h-5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 md:hidden">
            <div className="px-4 py-3 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocation('/');
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  handleNotesClick(e);
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
              >
                Demo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocation('/about');
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocation('/help');
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
              >
                Help
              </Button>
              
              {isAuthenticated() ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLocation('/profile');
                      setShowMobileMenu(false);
                    }}
                    className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                  >
                    Profile
                  </Button>
                  {user && user.user_type === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLocation('/admin-dashboard');
                        setShowMobileMenu(false);
                      }}
                      className="w-full justify-start text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors"
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocation('/login');
                      setShowMobileMenu(false);
                    }}
                    className="w-full justify-start border-[#476A92] text-[#476A92] hover:bg-[#476A92] hover:text-white transition-colors"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setLocation('/signup');
                      setShowMobileMenu(false);
                    }}
                    className="w-full justify-start bg-[#476A92] hover:bg-[#3d5c82] text-white transition-colors"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug Console - only render if enabled */}
      {isDebugConsoleEnabled && (
        <DebugConsole isOpen={showDebug} onToggle={() => setShowDebug(!showDebug)} />
      )}
    </header>
  );
}