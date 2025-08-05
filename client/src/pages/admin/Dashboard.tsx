import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Settings, Database } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { debug } from '../../lib/debug';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [user]);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated and is admin
      if (!user) {
        setLocation('/login');
        return;
      }

      if (user.user_type !== 'admin') {
        setLocation('/');
        return;
      }
    } catch (error) {
      debug.error('Auth check failed:', error);
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Administrative control panel for managing the application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and operational status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="text-lg">🟢</div>
              <div>
                <h4 className="font-medium">Application Status</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">All systems operational and running normally.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-lg">🔒</div>
              <div>
                <h4 className="font-medium">Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Authentication and authorization systems active.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-lg">💾</div>
              <div>
                <h4 className="font-medium">Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Supabase connection healthy and responsive.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Capabilities</CardTitle>
          <CardDescription>
            Available administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">User Management</Badge>
            <Badge variant="secondary">System Monitoring</Badge>
            <Badge variant="secondary">Security Controls</Badge>
            <Badge variant="secondary">Database Access</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Admin access granted to: <strong>{user?.email}</strong>
            </p>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrative functions are protected by role-based access control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
