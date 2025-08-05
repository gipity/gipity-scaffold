import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Mail, FileText, Smartphone } from 'lucide-react';
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            New to this scaffold? Here's everything you need to get started building your MVP.
          </p>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#476A92] dark:text-white mb-4">
            Getting started
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Learn the basics of using this scaffold
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#476A92]/10 rounded-lg">
                  <FileText className="w-6 h-6 text-[#476A92]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Creating notes</h4>
                  <p className="text-gray-600 dark:text-gray-400">Tap the + icon to add a new note with a title, body text, and optional photo using the native camera.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#476A92]/10 rounded-lg">
                  <Smartphone className="w-6 h-6 text-[#476A92]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mobile features</h4>
                  <p className="text-gray-600 dark:text-gray-400">This scaffold uses native features like camera, splash screen, and safe area support. Test by building via Appflow and installing on your device.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#476A92]/10 rounded-lg">
                  <Mail className="w-6 h-6 text-[#476A92]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Authentication</h4>
                  <p className="text-gray-600 dark:text-gray-400">Supabase Auth is pre-integrated. When you sign up, check your email for the confirmation link—it will return to the app on success.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Options */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#476A92] dark:text-white mb-4">
            Support options
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get help when you need it
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-[#476A92]/10 rounded-lg">
                    <FileText className="w-6 h-6 text-[#476A92]" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">GitHub repository</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete documentation, setup instructions, and source code
                </p>
                <a 
                  href="https://github.com/gipity/gipity-scaffold" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#476A92] text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold">Gipity Studio</h4>
                <p className="text-blue-50">
                  Join the community for live support, custom builds, and expert guidance from a seasoned founder
                </p>
                <a 
                  href="https://www.gipity.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium"
                >
                  <HelpCircle className="w-4 h-4" />
                  Join Gipity Studio
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-[#476A92]/10 rounded-lg">
                    <Mail className="w-6 h-6 text-[#476A92]" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Email support</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Need help with setup, deployment, or custom builds?
                </p>
                <a 
                  href="mailto:support@gipity.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#476A92] hover:bg-[#3d5c82] text-white rounded-lg transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};