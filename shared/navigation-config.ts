export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  onClick?: string; // Name of handler function
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  icon?: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    variant: 'ghost',
    className: 'text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors'
  },
  {
    id: 'demo',
    label: 'Demo',
    onClick: 'handleNotesClick',
    variant: 'ghost',
    className: 'text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors'
  },
  {
    id: 'about',
    label: 'About',
    path: '/about',
    variant: 'ghost',
    className: 'text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors'
  },
  {
    id: 'help',
    label: 'Help',
    path: '/help',
    variant: 'ghost',
    className: 'text-gray-600 hover:text-[#476A92] hover:bg-[#476A92]/10 transition-colors'
  }
];

export const AUTH_NAVIGATION: NavigationItem[] = [
  {
    id: 'signin',
    label: 'Sign In',
    path: '/login',
    variant: 'outline',
    className: 'border-[#476A92] text-[#476A92] hover:bg-[#476A92] hover:text-white transition-colors',
    requiresAuth: false
  },
  {
    id: 'signup',
    label: 'Sign Up',
    path: '/signup',
    variant: 'default',
    className: 'bg-[#476A92] hover:bg-[#3d5c82] text-white transition-colors',
    requiresAuth: false
  }
];