import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { getApiUrl } from '../lib/api';
import { authenticatedFetch } from '../lib/authenticated-fetch';

export const useAuthenticatedImage = (filePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, handleTokenExpiration } = useAuth();

  useEffect(() => {
    if (!filePath || !token) {
      setImageUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;
    let currentBlobUrl: string | null = null;

    const loadImage = async () => {
      setLoading(true);
      setError(null);
      setImageUrl(null); // Clear previous image URL

      try {
        const url = getApiUrl(`/api/file/images/${filePath}`);
        
        const response = await authenticatedFetch(`/api/file/images/${filePath}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store',
          token,
        }, handleTokenExpiration);

        if (!response.ok) {
          if (response.isAuthError) {
            return;
          }
          const errorText = await response.text();
          throw new Error(`Failed to load image: ${response.status} - ${errorText}`);
        }

        const blob = await response.blob();
        
        if (!isCancelled) {
          currentBlobUrl = URL.createObjectURL(blob);
          setImageUrl(currentBlobUrl);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load image');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup function - don't revoke blob URL here, let the second useEffect handle it
    return () => {
      isCancelled = true;
    };
  }, [filePath, token]);

  // Cleanup blob URLs when imageUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return { imageUrl, loading, error };
};