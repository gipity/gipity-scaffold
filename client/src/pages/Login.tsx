import React, { useState, useEffect } from 'react';
import { secureStorage } from '../lib/secure-storage';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../lib/auth-context';
import { debug } from '../lib/debug';
import { useToast } from '@/hooks/use-toast';
import { getFullApiUrl } from '@/lib/config';

export const Login: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated()) {
      debug.log('User already authenticated, redirecting to home');
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved credentials on component mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const credentials = await secureStorage.getCredentials();
        if (credentials.email) {
          setFormData(prev => ({
            ...prev,
            email: credentials.email || '',
            password: credentials.password || '',
            rememberMe: credentials.rememberMe
          }));
        }
      } catch (error) {
        debug.error('Failed to load saved credentials:', error);
      }
    };
    
    loadSavedCredentials();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Save credentials using secure storage
        try {
          await secureStorage.setCredentials(formData.email, formData.password, formData.rememberMe);
        } catch (error) {
          debug.error('Failed to save credentials:', error);
        }

        debug.log('Login successful, navigating to home page');
        
        // Use setTimeout to ensure auth state is updated before navigation
        setTimeout(() => {
          debug.log('Executing navigation to home page');
          setLocation('/');
        }, 100);
      } else {
        toast({
          title: 'Sign in failed',
          description: result.error || 'Invalid email or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      debug.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      // Show inline validation error
      return;
    }

    setIsResettingPassword(true);

    try {
      const response = await fetch(getFullApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setResetEmailSent(true);
      } else {
        toast({
          title: 'Password reset failed',
          description: result.error || 'Failed to send reset email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      debug.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 overflow-y-auto" style={{ paddingTop: 'calc(2rem + var(--safe-area-inset-top, 0px))' }}>
        <div className="flex items-center justify-center min-h-full">
          <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {resetEmailSent 
                ? "Check your email for reset instructions"
                : "Enter your email address and we'll send you a reset link"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className={!resetEmail.trim() && resetEmail !== '' ? 'border-red-300' : ''}
                  />
                  {!resetEmail.trim() && resetEmail !== '' && (
                    <p className="text-sm text-red-600">Email is required</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-[#476A92] hover:bg-[#3d5c82]" disabled={isResettingPassword || !resetEmail.trim()}>
                  {isResettingPassword ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-600 dark:text-green-400 text-sm">
                  ✓ Password reset email sent successfully
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>
            )}
            
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  setResetEmail('');
                }}
                className="text-sm"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 overflow-y-auto" style={{ paddingTop: 'calc(2rem + var(--safe-area-inset-top, 0px))' }}>
      <div className="flex items-center justify-center min-h-full">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your {import.meta.env.VITE_APP_NAME || 'App'} account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-[#476A92] bg-gray-100 border-gray-300 rounded focus:ring-[#476A92]"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </Label>
              </div>
              
              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#476A92] dark:text-[#476A92] hover:underline p-0"
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-[#476A92] hover:bg-[#3d5c82]" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#476A92] dark:text-[#476A92] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};