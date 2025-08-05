import { getApiUrl } from './api';
import { authenticatedFetch, getAuthenticatedApiResponse } from './authenticated-fetch';
import { debug } from './debug';

export interface UploadFileOptions {
  base64Data: string;
  fileName: string;
  contentType?: string;
}

export interface UploadResponse {
  success: boolean;
  filePath?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  error?: string;
  isAuthError?: boolean;
}

export interface FileUrlResponse {
  success: boolean;
  url?: string;
  error?: string;
  isAuthError?: boolean;
}

/**
 * File storage API for uploading and managing files through backend proxy
 */
export class FileApi {
  /**
   * Upload a file to Supabase storage via backend proxy
   */
  static async uploadFile(token: string, options: UploadFileOptions, onTokenExpiration?: () => void): Promise<UploadResponse> {
    const frontendUploadStartTime = performance.now();
    debug.log(`🕐 FRONTEND UPLOAD START: ${options.fileName} (${new Date().toISOString()})`);
    
    try {
      const fetchStartTime = performance.now();
      debug.log(`🕐 FRONTEND FETCH START: ${(fetchStartTime - frontendUploadStartTime).toFixed(2)}ms elapsed`);
      
      const response = await authenticatedFetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        token,
      }, onTokenExpiration);

      const fetchEndTime = performance.now();
      debug.log(`🕐 FRONTEND FETCH END: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms duration`);

      if (response.isAuthError) {
        const frontendUploadErrorTime = performance.now();
        debug.log(`🕐 FRONTEND UPLOAD AUTH ERROR: ${(frontendUploadErrorTime - frontendUploadStartTime).toFixed(2)}ms before auth error`);
        return { success: false, error: 'Session expired', isAuthError: true };
      }

      const jsonStartTime = performance.now();
      const data = await response.json();
      const jsonEndTime = performance.now();
      
      const frontendUploadEndTime = performance.now();
      debug.log(`🕐 FRONTEND JSON PARSE: ${(jsonEndTime - jsonStartTime).toFixed(2)}ms duration`);
      debug.log(`🕐 FRONTEND UPLOAD COMPLETE: ${(frontendUploadEndTime - frontendUploadStartTime).toFixed(2)}ms total duration`);
      
      return data;
    } catch (error) {
      const frontendUploadErrorTime = performance.now();
      debug.error('Upload failed:', error);
      debug.log(`🕐 FRONTEND UPLOAD ERROR: ${(frontendUploadErrorTime - frontendUploadStartTime).toFixed(2)}ms before error`);
      return { success: false, error: 'Upload failed' };
    }
  }

  /**
   * Get a signed URL for accessing a file
   */
  static async getFileUrl(token: string, bucket: string, filePath: string, onTokenExpiration?: () => void): Promise<FileUrlResponse> {
    try {
      const response = await authenticatedFetch(`/api/file/${bucket}/${filePath}`, {
        token,
      }, onTokenExpiration);

      if (response.isAuthError) {
        return { success: false, error: 'Session expired', isAuthError: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      debug.error('Failed to get file URL:', error);
      return { success: false, error: 'Failed to get file URL' };
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(token: string, bucket: string, filePath: string, onTokenExpiration?: () => void): Promise<{ success: boolean; error?: string; isAuthError?: boolean }> {
    try {
      const response = await authenticatedFetch(`/api/file/${bucket}/${filePath}`, {
        method: 'DELETE',
        token,
      }, onTokenExpiration);

      if (response.isAuthError) {
        return { success: false, error: 'Session expired', isAuthError: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      debug.error('Failed to delete file:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }
}