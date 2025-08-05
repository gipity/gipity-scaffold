import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { debug } from '../lib/debug';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FloatingKeyboardHide from '../components/FloatingKeyboardHide';

import { Capacitor } from '@capacitor/core';
import { getApiUrl } from '../lib/api';
import { authenticatedFetch } from '../lib/authenticated-fetch';

export default function Profile() {
  const { user, logout, refreshUser, handleTokenExpiration } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Update profile data
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };

      debug.log('Profile update - updateData:', updateData);
      debug.log('Profile update - platform:', Capacitor.getPlatform());
      
      const token = localStorage.getItem('app_token');
      if (!token) {
        handleTokenExpiration();
        return;
      }
      
      const response = await authenticatedFetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        token,
      }, handleTokenExpiration);

      const result = await response.json();
      debug.log('Profile update response:', { status: response.status, ok: response.ok, result });

      if (response.isAuthError) {
        return;
      }
      
      if (result.success) {
        // Refresh user data to immediately show changes
        await refreshUser();
        
        // Navigate back to home
        setLocation('/');
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update profile.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      debug.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Update your personal information and preferences.</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled={true}
                className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              />
              <p className="text-sm text-gray-500">
                Email address cannot be changed
              </p>
            </div>



            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-[#476a92] hover:bg-[#3a5a7a] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <FloatingKeyboardHide />
    </div>
  );
}