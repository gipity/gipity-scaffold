import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { authApi } from '@/lib/api';
import { debug } from '../lib/debug';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export const Confirm: React.FC = () => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    status: 'loading',
    message: 'Processing email confirmation...'
  });

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Extract token and type from URL hash parameters
        const hash = window.location.hash.substring(1); // Remove the # symbol
        const urlParams = new URLSearchParams(hash);
        
        const accessToken = urlParams.get('access_token');
        const type = urlParams.get('type');

        if (!accessToken || !type) {
          setConfirmationState({
            status: 'error',
            message: 'Invalid confirmation link. Please check your email and try again.'
          });
          return;
        }

        // Send confirmation data to backend using authApi
        const result = await authApi.confirm({
          access_token: accessToken,
          type: type
        });

        if (result.success) {
          setConfirmationState({
            status: 'success',
            message: result.message || 'Email confirmed successfully! You can now sign in.'
          });
        } else {
          setConfirmationState({
            status: 'error',
            message: result.error || 'Email confirmation failed. Please try again.'
          });
        }
      } catch (error) {
        debug.error('Confirmation error:', error);
        setConfirmationState({
          status: 'error',
          message: 'An unexpected error occurred. Please try again later.'
        });
      }
    };

    handleConfirmation();
  }, []);

  const getIcon = () => {
    switch (confirmationState.status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-[#476A92] animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (confirmationState.status) {
      case 'loading':
        return 'Confirming Email...';
      case 'success':
        return 'Email Confirmed!';
      case 'error':
        return 'Confirmation Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 overflow-y-auto" style={{ paddingTop: 'calc(2rem + var(--safe-area-inset-top, 0px))' }}>
      <div className="flex items-center justify-center min-h-full">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {confirmationState.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {confirmationState.status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your account has been successfully activated. You can now sign in to access your account.
              </p>
              <Link href="/login">
                <Button className="w-full bg-[#476A92] hover:bg-[#3d5c82]">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          )}
          
          {confirmationState.status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you continue to have issues, please contact support or try requesting a new confirmation email.
              </p>
              <div className="flex gap-2">
                <Link href="/signup" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Sign Up
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full bg-[#476A92] hover:bg-[#3d5c82]">
                    Try Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {confirmationState.status === 'loading' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};