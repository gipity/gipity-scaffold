import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, FileText, Smartphone, Globe } from 'lucide-react';
import iconImage from '../assets/icon-64x64.png';
import icon2x from '../assets/icon-128x128.png';
import icon3x from '../assets/icon-192x192.png';

export const Help: React.FC = () => {
  return (
    <div className="p-4 space-y-8 min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img 
              src={iconImage} 
              srcSet={`${iconImage} 1x, ${icon2x} 2x, ${icon3x} 3x`}
              alt="App Icon" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            New to this scaffold? Here's everything you need to get started building your MVP.
          </p>
        </div>
      </div>

      {/* Resources */}
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-[#476A92] dark:text-white">
                Ready to build your MVP?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Join the Gipity Studio for live support and deployment help
              </p>
              <div className="flex justify-center pt-4">
                <Button className="bg-[#476A92] hover:bg-[#3d5c82] text-white px-8 py-4 text-lg font-medium" asChild>
                  <a 
                    href="https://www.gipity.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    gipity.com
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};