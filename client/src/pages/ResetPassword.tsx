import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getFullApiUrl } from '@/lib/config';
import { debug } from '../lib/debug';

export const ResetPassword: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<{
    access_token: string;
    refresh_token: string;
    type: string;
  } | null>(null);

  // Extract tokens from URL hash on component mount
  useEffect(() => {
    const parseHashParams = () => {
      const hash = window.location.hash.substring(1); // Remove # symbol
      const params = new URLSearchParams(hash);
      
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');
      
      if (access_token && refresh_token && type === 'recovery') {
        setTokens({
          access_token,
          refresh_token,
          type
        });
      } else {
        toast({
          title: 'Invalid Reset Link',
          description: 'This password reset link is invalid or has expired.',
          variant: 'destructive',
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      }
    };

    parseHashParams();
  }, [toast, setLocation]);

  const validatePasswords = () => {
    if (!newPassword) {
      return false;
    }

    if (newPassword.length < 6) {
      return false;
    }

    if (newPassword !== confirmPassword) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokens) {
      toast({
        title: 'Invalid session',
        description: 'Password reset session is invalid.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getFullApiUrl('/api/auth/update-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        },
        body: JSON.stringify({ 
          password: newPassword
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Password updated successfully',
          description: 'Your password has been changed. You can now sign in with your new password.',
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          setLocation('/login');
        }, 2000);
      } else {
        toast({
          title: 'Password update failed',
          description: result.error || 'Failed to update password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      debug.error('Password update error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 overflow-y-auto" style={{ paddingTop: 'calc(2rem + var(--safe-area-inset-top, 0px))' }}>
      <div className="flex items-center justify-center min-h-full">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-[#476A92] hover:bg-[#3d5c82]" disabled={isLoading}>
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={() => setLocation('/login')}
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
};