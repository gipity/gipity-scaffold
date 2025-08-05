import { createClient } from '@supabase/supabase-js';
import { debug } from './debug';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});



// Note: User creation moved to adminAuthOperations.createUserWithRecord
// This function is deprecated - use adminAuthOperations.createUserWithRecord instead
export const createUser = async (email: string, password: string, userType: 'user' | 'admin' = 'user') => {
  debug.warn('createUser is deprecated - use adminAuthOperations.createUserWithRecord instead');
  const { adminAuthOperations } = await import('./supabase-auth');
  return await adminAuthOperations.createUserWithRecord(email, password, userType);
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};



// File storage utilities

export const uploadFile = async (bucketName: string, filePath: string, file: Buffer, contentType: string) => {
  const supabaseUploadStartTime = performance.now();
  debug.log(`🕐 SUPABASE STORAGE UPLOAD START: ${bucketName}/${filePath} (${file.length} bytes)`);
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType,
      upsert: true
    });
  
  const supabaseUploadEndTime = performance.now();
  debug.log(`🕐 SUPABASE STORAGE UPLOAD END: ${(supabaseUploadEndTime - supabaseUploadStartTime).toFixed(2)}ms duration`);
    
  if (error) {
    debug.log(`❌ SUPABASE STORAGE UPLOAD ERROR: ${error.message} after ${(supabaseUploadEndTime - supabaseUploadStartTime).toFixed(2)}ms`);
    throw error;
  }
  
  return data;
};

export const deleteFile = async (bucketName: string, filePath: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([filePath]);
    
  if (error) {
    throw error;
  }
  
  return data;
};

export const getFileUrl = async (bucketName: string, filePath: string) => {
  const { data } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(filePath, 3600); // 1 hour expiry
    
  return data?.signedUrl;
};

export const downloadFile = async (bucketName: string, filePath: string) => {
  const supabaseDownloadStartTime = performance.now();
  debug.log(`🕐 SUPABASE STORAGE DOWNLOAD START: ${bucketName}/${filePath}`);
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .download(filePath);
  
  const supabaseDownloadEndTime = performance.now();
  debug.log(`🕐 SUPABASE STORAGE DOWNLOAD END: ${(supabaseDownloadEndTime - supabaseDownloadStartTime).toFixed(2)}ms duration`);
    
  if (error) {
    debug.log(`❌ SUPABASE STORAGE DOWNLOAD ERROR: ${error.message} after ${(supabaseDownloadEndTime - supabaseDownloadStartTime).toFixed(2)}ms`);
    throw error;
  }
  
  if (data) {
    const arrayBuffer = await data.arrayBuffer();
    const firstBytes = new Uint8Array(arrayBuffer.slice(0, 10));
    const hexBytes = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`📥 Supabase returned: ${data.size} bytes, first 10: ${hexBytes}`);
  }
  
  return data;
};


