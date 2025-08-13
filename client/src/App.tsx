import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { useEffect, useState } from "react";
import { initializeCapacitor, getEnvironmentInfo } from "./lib/capacitor";
import { initializeNavigationBar } from "./lib/navigation-bar";
import { debug } from './lib/debug';
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthNavigationSetup } from "./components/AuthNavigationSetup";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ResetPassword } from "./pages/ResetPassword";
import { Confirm } from "./pages/Confirm";
import Profile from "./pages/Profile";
import { Notes } from "./pages/Notes";
import { About } from "./pages/About";
import { Help } from "./pages/Help";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "@/pages/not-found";
import DebugConsole from "./components/DebugConsole";


function Router() {
  return (
    <Switch>
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/confirm" component={Confirm} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Admin routes */}
      <Route path="/admin-dashboard">
        <ProtectedRoute>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Public main app routes */}
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>

      <Route path="/help">
        <Layout>
          <Help />
        </Layout>
      </Route>

      {/* Protected user-specific routes */}
      <Route path="/profile">
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/notes">
        <ProtectedRoute>
          <Layout>
            <Notes />
          </Layout>
        </ProtectedRoute>
      </Route>


      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        debug.log('Starting app initialization...');
        
        // Shorter timeout for mobile environments to prevent hanging
        const initTimeout = setTimeout(() => {
          debug.warn('Initialization timeout reached, completing startup');
          setIsInitialized(true);
        }, 3000); // Reduced to 3 seconds

        // Wait for DOM to be ready (with timeout)
        if (document.readyState !== 'complete') {
          debug.log('Waiting for DOM to be ready...');
          await Promise.race([
            new Promise(resolve => {
              window.addEventListener('load', resolve, { once: true });
            }),
            new Promise(resolve => setTimeout(resolve, 1000)) // 1 second max wait
          ]);
        }

        // Initialize Capacitor with shorter timeout for mobile
        debug.log('Initializing Capacitor...');
        try {
          await Promise.race([
            initializeCapacitor(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Capacitor init timeout')), 2000))
          ]);
        } catch (error) {
          debug.warn('Capacitor initialization timed out, continuing anyway:', error);
        }

        // Initialize navigation bar for Android
        try {
          await initializeNavigationBar();
        } catch (error) {
          debug.warn('Navigation bar initialization failed:', error);
        }

        // Log environment info for debugging
        debug.log('Getting environment info...');
        try {
          const defaultEnvInfo = {
            platform: 'unknown',
            isNative: false,
            isCapacitorAvailable: false,
            isPWASupported: false,
            isServiceWorkerSupported: false,
            isDevelopment: false,
            isReplit: false,
            forceWebMode: false
          };
          
          const envInfo = await Promise.race([
            getEnvironmentInfo(),
            new Promise((resolve) => setTimeout(() => resolve(defaultEnvInfo), 1000))
          ]) as typeof defaultEnvInfo;
          debug.log('Environment info:', envInfo);

          // Register service worker if supported and not in web mode
          if (envInfo.isServiceWorkerSupported && envInfo.isNative) {
            try {
              debug.log('Registering service worker...');
              await Promise.race([
                navigator.serviceWorker.register('/sw.js'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 1500))
              ]);
              debug.log('Service Worker registered');
            } catch (error) {
              debug.warn('Service Worker registration failed:', error);
            }
          }
        } catch (error) {
          debug.warn('Environment detection failed:', error);
        }

        clearTimeout(initTimeout);
        debug.log('App initialization complete');
        setIsInitialized(true);
      } catch (error) {
        debug.error('App initialization failed:', error);
        // Always set initialized to true to prevent infinite loading
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-gray-50"
        style={{
          height: '100vh',
          padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing {import.meta.env.VITE_APP_NAME || 'App'}...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthNavigationSetup />
        <Toaster />
        <div className="h-full">
          <Router />
          {/* Only render DebugConsole if enabled */}
          {import.meta.env.VITE_SHOW_DEBUG_CONSOLE === 'true' && <DebugConsole />}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
