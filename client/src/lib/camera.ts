import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { debug } from './debug';
import { Filesystem } from '@capacitor/filesystem';
import { isNativePlatform } from './capacitor';

export interface CapturePhotoOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
}

export interface CapturedPhoto {
  webPath?: string;
  base64String?: string;
  format: string;
}

/**
 * Camera utility that handles photo capture across web and native platforms
 */
export class CameraService {
  // Android restoration handler state
  private static pendingCameraResolver: ((result: any) => void) | null = null;
  private static restorationHandlerSetup = false;
  /**
   * Setup Android restoration handler for camera crashes (Android 12/13+)
   * Only runs on native platforms, safe for web/iOS
   */
  static async setupRestorationHandler(): Promise<void> {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform() || this.restorationHandlerSetup) {
      return;
    }

    try {
      debug.log('[AndroidCameraFix] Setting up app restoration handler for Android camera crashes');
      
      // Dynamic import to avoid issues on web
      const { App } = await import('@capacitor/app');
      
      // Listen for app restoration after Android process termination
      App.addListener('appRestoredResult', (data: any) => {
        debug.log('[AndroidCameraFix] App restoration detected:', data);
        
        if (data.pluginId === 'Camera' && data.methodName === 'getPhoto' && this.pendingCameraResolver) {
          debug.log('[AndroidCameraFix] Camera restoration detected - resolving pending camera operation');
          this.pendingCameraResolver(data.data);
          this.pendingCameraResolver = null;
        }
      });
      
      this.restorationHandlerSetup = true;
      debug.log('[AndroidCameraFix] Restoration handler setup complete');
    } catch (error) {
      debug.warn('[AndroidCameraFix] Failed to setup restoration handler:', error);
    }
  }

  /**
   * Check if camera is available on the current platform
   */
  static async isAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      // On native platforms, assume camera is available if permissions are granted
      return true;
    } else {
      // On web, check if getUserMedia is available
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
  }

  /**
   * Capture a photo using the device camera
   */
  static async capturePhoto(options: CapturePhotoOptions = {}): Promise<CapturedPhoto> {
    const defaultOptions = {
      // Platform-specific result type: Base64 for native (eliminates filesystem access), Uri for web
      resultType: Capacitor.isNativePlatform() ? CameraResultType.Base64 : CameraResultType.Uri,
      source: CameraSource.Camera,          // Force camera (not gallery)
      allowEditing: false,                  // ✅ Provides live preview with front/back switching
      quality: 70,                          // Balance quality/performance
      saveToGallery: false,                 // Don't clutter device gallery - app manages photos
      ...options
    };

    try {
      // Comprehensive camera and environment debug logging
      debug.log('=== COMPREHENSIVE CAMERA DEBUG ===');
      debug.log('📱 PLATFORM DETECTION:');
      debug.log('  Capacitor.getPlatform():', Capacitor.getPlatform());
      debug.log('  Capacitor.isNativePlatform():', Capacitor.isNativePlatform());
      debug.log('  isNativePlatform() helper:', isNativePlatform());
      debug.log('  window.Capacitor exists:', !!(window as any).Capacitor);
      debug.log('  User agent:', navigator.userAgent);
      
      debug.log('🌍 ENVIRONMENT VARIABLES:');
      debug.log('  NODE_ENV:', import.meta.env.NODE_ENV);
      debug.log('  VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
      debug.log('  VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);
      debug.log('  DEV mode:', import.meta.env.DEV);
      debug.log('  PROD mode:', import.meta.env.PROD);
      
      debug.log('📷 CAMERA CONFIGURATION:');
      debug.log('  Final camera options:', JSON.stringify(defaultOptions, null, 2));
      debug.log('  Requested allowEditing:', defaultOptions.allowEditing);
      debug.log('  Expected behavior: allowEditing=false should provide live preview');
      
      debug.log('🔧 CAPACITOR PLUGINS:');
      debug.log('  Camera plugin available:', !!(window as any).Capacitor?.Plugins?.Camera);
      debug.log('  Camera from import available:', !!Camera);
      debug.log('  Window.Camera available:', !!(window as any).Camera);
      
      debug.log('⏱️ OPERATION START:');
      debug.log('  Timestamp:', new Date().toISOString());
      debug.log('  Operation: Camera.getPhoto()');
      debug.log('====================================');
      
      const startTime = performance.now();
      
      // For native platforms, set up restoration handler and pending resolver
      if (Capacitor.isNativePlatform()) {
        await this.setupRestorationHandler();
        
        return new Promise((resolve, reject) => {
          // Set pending resolver for Android restoration
          this.pendingCameraResolver = (result: any) => {
            const endTime = performance.now();
            debug.log('=== CAMERA RESULT DEBUG (RESTORED) ===');
            debug.log('✅ SUCCESS: Photo captured via restoration');
            debug.log('  Duration:', `${(endTime - startTime).toFixed(2)}ms`);
            debug.log('  Result webPath:', result.webPath);
            debug.log('  Result format:', result.format);
            debug.log('  Has base64String:', !!result.base64String);
            debug.log('  Result keys:', Object.keys(result));
            debug.log('=======================================');
            
            resolve({
              webPath: result.webPath,
              base64String: result.base64String,
              format: result.format || 'jpeg'
            });
          };
          
          // Attempt camera capture
          Camera.getPhoto(defaultOptions)
            .then((image) => {
              // Clear pending resolver on success
              this.pendingCameraResolver = null;
              
              const endTime = performance.now();
              debug.log('=== CAMERA RESULT DEBUG ===');
              debug.log('✅ SUCCESS: Photo captured successfully');
              debug.log('  Duration:', `${(endTime - startTime).toFixed(2)}ms`);
              debug.log('  Result webPath:', image.webPath);
              debug.log('  Result format:', image.format);
              debug.log('  Has base64String:', !!image.base64String);
              debug.log('  Result keys:', Object.keys(image));
              debug.log('==============================');
              
              resolve({
                webPath: image.webPath,
                base64String: image.base64String,
                format: image.format || 'jpeg'
              });
            })
            .catch((error) => {
              // Clear pending resolver on error
              this.pendingCameraResolver = null;
              reject(error);
            });
        });
      } else {
        // Web platform - use existing logic
        const image = await Camera.getPhoto(defaultOptions);
        const endTime = performance.now();
        
        debug.log('=== CAMERA RESULT DEBUG ===');
        debug.log('✅ SUCCESS: Photo captured successfully');
        debug.log('  Duration:', `${(endTime - startTime).toFixed(2)}ms`);
        debug.log('  Result webPath:', image.webPath);
        debug.log('  Result format:', image.format);
        debug.log('  Has base64String:', !!image.base64String);
        debug.log('  Result keys:', Object.keys(image));
        debug.log('==============================');
        
        return {
          webPath: image.webPath,
          base64String: image.base64String,
          format: image.format || 'jpeg'
        };
      }
    } catch (error) {
      debug.log('=== CAMERA ERROR DEBUG ===');
      debug.error('❌ CAMERA CAPTURE FAILED');
      debug.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      debug.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      debug.error('  Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      debug.error('  Camera options used:', JSON.stringify(defaultOptions, null, 2));
      debug.error('  Platform context:', {
        isNative: Capacitor.isNativePlatform(),
        platform: Capacitor.getPlatform(),
        userAgent: navigator.userAgent.substring(0, 100)
      });
      debug.log('=============================');
      
      // Re-throw the original error with context
      throw new Error(`Camera capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Select photo from gallery
   */
  static async selectFromGallery(): Promise<CapturedPhoto> {
    // For web, get base64 directly to avoid blob URL fetch issues
    if (!Capacitor.isNativePlatform()) {
      debug.log('🌐 WEB GALLERY: Using Base64 result type for direct conversion');
      return this.capturePhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64
      });
    } else {
      // Native platforms use Base64 to eliminate filesystem access
      return this.capturePhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64
      });
    }
  }

  /**
   * Capture photo with base64 result for web to avoid blob URL issues
   */
  static async capturePhotoBase64(): Promise<CapturedPhoto> {
    return this.capturePhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      allowEditing: false,
      quality: 80
    });
  }

  /**
   * Extract real filesystem path from Capacitor webPath URL
   */
  private static extractRealPath(webPath: string): string {
    // Handle both iOS and Android Capacitor webPath prefixes
    return webPath
      .replace('capacitor://localhost/_capacitor_file_', '')
      .replace('https://localhost/_capacitor_file_', '');
  }

  /**
   * Convert image to base64 for upload using camera result
   */
  static async convertToBase64(cameraResult: { webPath?: string; path?: string; format: string }): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      try {
        debug.log('🔄 NATIVE BASE64 CONVERSION: Reading captured file directly');
        debug.log('  Camera result webPath:', cameraResult.webPath);
        debug.log('  Camera result path:', cameraResult.path);
        
        // Priority order: use path property first, then extract from webPath
        let filePath = cameraResult.path;
        
        if (!filePath && cameraResult.webPath) {
          // Extract real filesystem path from Capacitor webPath URL
          filePath = this.extractRealPath(cameraResult.webPath);
          debug.log('  Extracted real path from webPath:', filePath);
        }
        
        if (!filePath) {
          throw new Error('No file path available in camera result');
        }
        
        debug.log('  Using filesystem path:', filePath);
        
        const fileData = await Filesystem.readFile({
          path: filePath
        });
        
        // Ensure we have string data (base64), not Blob
        const base64Data = typeof fileData.data === 'string' ? fileData.data : '';
        debug.log('✅ File read successfully, base64 length:', base64Data.length);
        return base64Data;
      } catch (error) {
        debug.error('❌ FILESYSTEM READ FAILED:', error);
        debug.error('  Camera result:', cameraResult);
        throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // On web, blob URLs can't be fetched cross-origin, return empty string
      // The solution is to use base64 result type from the start on web
      debug.log('🔄 WEB BASE64 CONVERSION: Blob URL cannot be fetched on web');
      return '';
    }
  }

  /**
   * Check and request camera permissions
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      debug.log('=== CAMERA PERMISSIONS DEBUG ===');
      debug.log('🔐 PERMISSION CHECK START:');
      debug.log('  Platform:', Capacitor.getPlatform());
      debug.log('  IsNative:', Capacitor.isNativePlatform());
      
      // In web environment, permission system is limited
      if (!Capacitor.isNativePlatform()) {
        debug.log('🌐 WEB ENVIRONMENT:');
        debug.log('  Using fallback permission handling');
        debug.log('  Result: Permissions assumed granted for web');
        debug.log('================================');
        return true; // Allow web fallback to proceed
      }

      debug.log('📱 NATIVE ENVIRONMENT:');
      debug.log('  Checking native camera permissions...');
      
      const permissions = await Camera.checkPermissions();
      debug.log('  Current permissions:', JSON.stringify(permissions, null, 2));
      
      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        debug.log('✅ PERMISSIONS ALREADY GRANTED');
        debug.log('  Camera permission: granted');
        debug.log('  Photos permission: granted');
        debug.log('================================');
        return true;
      }
      
      debug.log('⚠️ REQUESTING MISSING PERMISSIONS:');
      debug.log('  Camera granted:', permissions.camera === 'granted');
      debug.log('  Photos granted:', permissions.photos === 'granted');
      
      // Request permissions if not granted (native only)
      const requestResult = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      
      debug.log('  Permission request result:', JSON.stringify(requestResult, null, 2));
      
      const finalResult = requestResult.camera === 'granted' && requestResult.photos === 'granted';
      debug.log('🎯 FINAL PERMISSION RESULT:', finalResult ? 'GRANTED' : 'DENIED');
      debug.log('================================');
      
      return finalResult;
    } catch (error) {
      debug.log('=== PERMISSION ERROR DEBUG ===');
      debug.error('❌ PERMISSION CHECK FAILED');
      debug.error('  Error:', error instanceof Error ? error.message : 'Unknown error');
      debug.error('  Platform:', Capacitor.getPlatform());
      debug.error('  IsNative:', Capacitor.isNativePlatform());
      
      // In web environment, continue with fallback
      if (!Capacitor.isNativePlatform()) {
        debug.log('🔄 WEB FALLBACK:');
        debug.log('  Continuing despite permission error');
        debug.log('==============================');
        return true;
      }
      
      debug.log('❌ NATIVE PERMISSION FAILURE');
      debug.log('==============================');
      return false;
    }
  }
}