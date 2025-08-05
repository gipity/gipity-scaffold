import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Image } from 'lucide-react';
import { CameraService } from '../lib/camera';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { debug } from '@/lib/debug';

export interface PhotoData {
  base64Data: string;
  fileName: string;
  contentType: string;
}

interface CameraCaptureProps {
  onPhotoCapture?: (photoData: PhotoData) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCapture,
  onCancel,
  disabled = false
}) => {
  const { toast } = useToast();
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);

  React.useEffect(() => {
    CameraService.isAvailable().then(setCameraAvailable);
  }, []);

  const handleCapturePhoto = async () => {
    try {
      const hasPermissions = await CameraService.checkPermissions();
      if (!hasPermissions) {
        toast({
          title: 'Camera permissions required',
          description: 'Please grant camera permissions to take photos',
          variant: 'destructive'
        });
        return;
      }

      // Use base64 capture on web to avoid blob URL fetch issues
      const photo = !Capacitor.isNativePlatform() 
        ? await CameraService.capturePhotoBase64()
        : await CameraService.capturePhoto({ quality: 80 });

      // Get base64 data
      const base64Data = photo.base64String || 
        (photo.webPath ? await CameraService.convertToBase64(photo) : '');
      
      if (!base64Data) {
        throw new Error('Failed to process photo data');
      }

      const photoData: PhotoData = {
        base64Data,
        fileName: `photo-${Date.now()}.${photo.format}`,
        contentType: `image/${photo.format}`
      };

      onPhotoCapture?.(photoData);
    } catch (error) {
      debug.error('Photo capture failed:', error);
      toast({
        title: 'Camera error',
        description: error instanceof Error ? error.message : 'Failed to capture photo',
        variant: 'destructive'
      });
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const photo = await CameraService.selectFromGallery();
      debug.log('📸 GALLERY PHOTO RESULT:', {
        hasBase64String: !!photo.base64String,
        hasWebPath: !!photo.webPath,
        format: photo.format
      });
      
      // Get base64 data - for web gallery selection, base64String should be available directly
      let base64Data = photo.base64String;
      
      // Fallback to conversion only if needed (native platforms)
      if (!base64Data && photo.webPath) {
        debug.log('🔄 FALLBACK: Converting webPath to base64...');
        base64Data = await CameraService.convertToBase64(photo);
      }
      
      if (!base64Data) {
        throw new Error('Failed to process photo data - no base64 or webPath available');
      }

      debug.log('✅ BASE64 DATA READY, length:', base64Data.length);
      
      const photoData: PhotoData = {
        base64Data,
        fileName: `photo-${Date.now()}.${photo.format}`,
        contentType: `image/${photo.format}`
      };

      onPhotoCapture?.(photoData);
    } catch (error) {
      debug.error('Photo selection failed:', error);
      toast({
        title: 'Selection error',
        description: error instanceof Error ? error.message : 'Failed to select photo',
        variant: 'destructive'
      });
    }
  };

  if (cameraAvailable === null) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            Checking camera availability...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Add a photo to your note</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCapturePhoto}
              disabled={disabled}
              className="flex-1"
              title="Take Photo"
            >
              <Camera className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSelectFromGallery}
              disabled={disabled}
              className="flex-1 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              title="Gallery"
            >
              <Image className="w-5 h-5" />
            </Button>
          </div>
          
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};