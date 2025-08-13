import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Camera, FileText, Smartphone, Code, Zap, Shield, Globe, Rocket, Star, ExternalLink } from 'lucide-react';
import iconImage from '../assets/icon-64x64.png';
import icon2x from '../assets/icon-128x128.png';
import icon3x from '../assets/icon-192x192.png';

export const About: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Task Management Scaffold</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            A production-ready app foundation built for rapid prototyping and MVP development
          </p>
          <div className="flex justify-center">
            <Badge className="bg-[#476A92] hover:bg-[#476A92]/80 text-white">
              <Star className="w-3 h-3 mr-1" />
              v1.0.0-beta Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#476A92]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#476A92]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#476A92]" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Rich Content Management</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full-featured note system with multimedia attachments, structured data, and real-time sync
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#476A92]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#476A92]/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#476A92]" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Native Camera Integration</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seamless photo capture and gallery access with Supabase storage backend
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#476A92]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#476A92]/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#476A92]" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Cross-Platform Ready</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Deploy to iOS, Android, and web from a single codebase with native performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#476A92]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#476A92]/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#476A92]" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Production Security</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built-in authentication, JWT tokens, and secure API architecture from day one
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resources */}
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-[#476A92] dark:text-white">
                Ready to start your MVP app?
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