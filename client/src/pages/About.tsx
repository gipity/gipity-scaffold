import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Camera, FileText, Smartphone, Code, Zap, Shield, Globe, Rocket, Star, ExternalLink, Mail } from 'lucide-react';
import iconImage from '../assets/icon-64x64.png';
import icon2x from '../assets/icon-128x128.png';
import icon3x from '../assets/icon-192x192.png';

export const About: React.FC = () => {
  return (
    <div className="p-4 space-y-8 min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center mb-6">
            <img 
              src={iconImage} 
              srcSet={`${iconImage} 1x, ${icon2x} 2x, ${icon3x} 3x`}
              alt="App Icon" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Gipity Scaffolding App</h1>
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

      {/* Deployment Options */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#476A92]" />
              Multi-Platform Deployment
            </CardTitle>
            <CardDescription>
              One codebase, deploy everywhere with production-grade infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-[#476A92]/5 rounded-lg border border-[#476A92]/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#476A92]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">Web Application</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Standard web browser deployment</div>
                  </div>
                </div>
                <Badge className="bg-[#476A92] text-white hover:bg-[#3d5c82]">Ready</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#476A92]/5 rounded-lg border border-[#476A92]/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#476A92]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">Progressive Web App</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Instant deployment, offline capable</div>
                  </div>
                </div>
                <Badge className="bg-[#476A92] text-white hover:bg-[#3d5c82]">Ready</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#476A92]/5 rounded-lg border border-[#476A92]/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-[#476A92]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">iOS & Android Apps</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Native performance via Ionic Appflow</div>
                  </div>
                </div>
                <Badge className="bg-[#476A92] text-white hover:bg-[#3d5c82]">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Comprehensive Features List */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#476A92]" />
              Everything Included Out of the Box
            </CardTitle>
            <CardDescription>
              A complete production-ready foundation with 50+ built-in features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              
              {/* Authentication & Security */}
              <div>
                <h4 className="font-semibold text-[#476A92] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Authentication & Security
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Complete login/signup flow with Supabase Auth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Password reset via email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Email confirmation system with app redirect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>JWT token management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Secure credential storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Session persistence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Admin role system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>API endpoint protection</span>
                  </div>
                </div>
              </div>

              {/* Content Management */}
              <div>
                <h4 className="font-semibold text-[#476A92] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Management System
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Rich note creation with title and body text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Photo attachments via native camera integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>File upload to cloud storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Image preview & management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Real-time content stats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Content search & filtering</span>
                  </div>
                </div>
              </div>

              {/* Mobile Experience */}
              <div>
                <h4 className="font-semibold text-[#476A92] mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile-First Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Native camera integration with photo capture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Gallery photo selection and management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Native splash screen and safe area support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Appflow integration for device testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Pull-to-refresh functionality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>iOS safe area handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Android navigation bar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Keyboard behavior optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Touch-friendly interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Responsive design system</span>
                  </div>
                </div>
              </div>

              {/* Developer Experience */}
              <div>
                <h4 className="font-semibold text-[#476A92] mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Developer Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>TypeScript throughout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Component library (shadcn/ui)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Dark mode support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Hot reload development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Environment configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Error boundary handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Form validation system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Toast notifications</span>
                  </div>
                </div>
              </div>

              {/* Backend & Infrastructure */}
              <div>
                <h4 className="font-semibold text-[#476A92] mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Backend & Infrastructure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>RESTful API architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Supabase integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>PostgreSQL database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>File storage system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Email service integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>CORS configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Rate limiting & security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#476A92] rounded-full"></div>
                    <span>Health check endpoints</span>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-[#476A92]" />
              Modern Technology Stack
            </CardTitle>
            <CardDescription>
              Enterprise-grade tools for rapid development and scalability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">React 18 + TypeScript</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">Supabase Backend</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">Capacitor Native</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">shadcn/ui Components</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#476A92]/5 rounded-lg">
                <div className="w-2 h-2 bg-[#476A92] rounded-full"></div>
                <span className="text-sm font-medium">Vite Build System</span>
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
                Ready to start your MVP app?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Get the Gipity scaffolding app and join our support studio today
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
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
                <Button variant="outline" className="hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 px-8 py-4 text-lg font-medium" asChild>
                  <a href="mailto:support@gipity.com">
                    <Mail className="w-5 h-5 mr-2" />
                    Got questions?
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