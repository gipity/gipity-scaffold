import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, CheckCircle } from 'lucide-react';

export interface PhotoData {
  base64Data: string;
  fileName: string;
  contentType: string;
}

interface PhotoPreviewProps {
  photoData: PhotoData;
  onRemove: () => void;
  disabled?: boolean;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photoData,
  onRemove,
  disabled = false
}) => {
  const imageDataUrl = `data:${photoData.contentType};base64,${photoData.base64Data}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Success indicator */}
          <div className="flex items-center justify-between p-3 bg-[#476A92]/10 dark:bg-[#476A92]/20 rounded border border-[#476A92]/20">
            <div className="flex items-center text-[#476A92] dark:text-[#476A92]">
              <CheckCircle className="w-4 h-4 mr-2" />
              Photo ready to save
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-800/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Image thumbnail */}
          <div className="relative">
            <img
              src={imageDataUrl}
              alt="Photo preview"
              className="w-full max-w-xs mx-auto rounded-lg border shadow-sm"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          </div>

          {/* File info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Photo will be saved when you create/update the note</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};