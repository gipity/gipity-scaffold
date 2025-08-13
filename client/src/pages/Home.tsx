import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../lib/auth-context';
import { 
  FileText, 
  Camera, 
  Smartphone, 
  Zap, 
  Shield, 
  Rocket,
  ArrowRight,
  Star,
  Database,
  Globe,
  Code2
} from 'lucide-react';
import { Link } from 'wouter';
import iconImage from '../assets/icon-64x64.png';
import icon2x from '../assets/icon-128x128.png';
import icon3x from '../assets/icon-192x192.png';

export const Home: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-8 min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Welcome Section */}
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Your native app scaffold is ready to customize
          </p>
        </div>
      </div>

      {/* Main Value Proposition */}
      <Card className="bg-[#476A92] text-white border-0 shadow-lg max-w-4xl mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/20 rounded-full">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">
              Launch your MVP in 30 days
            </h2>
            <p className="text-blue-50 leading-relaxed text-lg max-w-2xl mx-auto">
              Skip months of setup. This scaffold gives you production-ready auth, database, file storage, and native mobile deployment—all configured and ready to extend.
            </p>
            <div className="flex justify-center pt-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                Web + iOS + Android Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Try Demo Features */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 max-w-4xl mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-[#476A92] rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Try the demo features
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              See what's already working: notes with photos, user auth, and mobile-optimized UI
            </p>
            <Link href="/notes">
              <Button className="bg-[#476A92] hover:bg-[#3d5c82] text-white px-6 py-3">
                <FileText className="w-5 h-5 mr-2" />
                Try it Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* What's Already Built */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#476A92] dark:text-white mb-4">
            What's already built
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to start building your app today
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rich Content System</h4>
                  <p className="text-gray-600 dark:text-gray-400">Notes with titles, content, and photo attachments using Supabase storage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Camera className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Native Camera Integration</h4>
                  <p className="text-gray-600 dark:text-gray-400">Capture photos with native mobile camera, web fallback included</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Complete Authentication</h4>
                  <p className="text-gray-600 dark:text-gray-400">JWT auth, user profiles, admin roles, and email confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Database className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Production Database</h4>
                  <p className="text-gray-600 dark:text-gray-400">Supabase PostgreSQL with RLS policies and optimized queries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Deployment */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center gap-6 mb-6">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Globe className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Smartphone className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Code2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#476A92] dark:text-white">Deploy everywhere</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg max-w-2xl mx-auto">
                One codebase, three platforms. Web deployment on Replit, native iOS/Android builds via Ionic Appflow—all configured and ready to go.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2">
                  Web (PWA)
                </Badge>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2">
                  iOS Native
                </Badge>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2">
                  Android Native
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-[#476A92] dark:text-white">
                Need help customizing?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Join the Gipity Studio for live support and deployment help
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="https://www.gipity.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#476A92] hover:bg-[#3d5c82] text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <Globe className="w-5 h-5" />
                  gipity.com
                </a>
                <a 
                  href="https://github.com/gipity/gipity-scaffold" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-lg font-medium"
                >
                  <Code2 className="w-5 h-5" />
                  GitHub Repo
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};