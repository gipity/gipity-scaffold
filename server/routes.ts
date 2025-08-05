import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { verifyAdminUser, verifyToken, requireAdmin, AuthRequest } from "./lib/auth";
import { sendWelcomeEmail } from "./lib/email";
import { supabaseAdmin, uploadFile, deleteFile, getFileUrl, downloadFile } from "./lib/supabase";
import { dbUtils, getSupabaseRLSBypass } from "./lib/database";
import { authOperations, adminAuthOperations } from "./lib/supabase-auth";
import { userRegistrationSchema, userLoginSchema, passwordResetSchema, passwordUpdateSchema, createNoteSchema, updateNoteSchema } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration endpoint - App signup
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = userRegistrationSchema.parse(req.body);
      const { email, password, first_name, last_name } = validatedData;

      // Check if user already exists in our database first
      const supabase = getSupabaseRLSBypass();
      const { data: existingDbUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingDbUser) {
        return res.status(409).json({ 
          error: 'An account with this email already exists. Please try logging in instead.' 
        });
      }

      // New user - create auth user with redirect URL and store name data temporarily in metadata
      // We'll use this only to pass data through to confirmation, then rely on custom users table
      const redirectUrl = `${req.protocol}://${req.get('host')}/confirm`;
      const { data: authData, error: authError } = await authOperations.signUp(email, password, {
        emailRedirectTo: redirectUrl,
        data: {
          first_name,
          last_name,
          user_type: 'user'
        }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // DO NOT create user record in database yet - wait for email confirmation
      console.log('Auth user created, waiting for email confirmation:', authData.user?.id);

      res.json({ 
        success: true, 
        message: 'Account created successfully! Please check your email to confirm your account before signing in.'
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error in user registration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Email confirmation endpoint
  app.post('/api/auth/confirm', async (req, res) => {
    try {
      const { access_token, type } = req.body;

      if (!access_token || type !== 'signup') {
        return res.status(400).json({ error: 'Invalid confirmation data' });
      }

      // Verify the token and get user data using auth client
      const { data: userData, error: tokenError } = await authOperations.getUser(access_token);

      if (tokenError || !userData.user) {
        console.error('Token verification failed:', tokenError);
        return res.status(400).json({ error: 'Invalid or expired confirmation token' });
      }

      const user = userData.user;

      // Check if user is confirmed
      if (!user.email_confirmed_at) {
        return res.status(400).json({ error: 'Email not confirmed' });
      }

      // Check if user record already exists in database
      const supabase = getSupabaseRLSBypass();
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return res.json({ 
          success: true, 
          message: 'Email already confirmed. You can now sign in.' 
        });
      }

      // Create user record in database - extract data from auth metadata temporarily
      // After this, the custom users table becomes the single source of truth
      const { first_name, last_name, user_type } = user.user_metadata || {};
      
      let insertResult;
      try {
        // Try new schema with first_name and last_name from metadata
        insertResult = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            user_type: user_type || 'user',
            first_name: first_name || null,
            last_name: last_name || null
          })
          .select()
          .single();
      } catch (newSchemaError) {
        console.log('New schema insert failed, trying old schema...');
        // Fallback to old schema without first_name and last_name
        insertResult = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            user_type: user_type || 'user'
          })
          .select()
          .single();
      }
      
      if (insertResult.error) {
        console.error('Failed to create user record:', insertResult.error);
        return res.status(500).json({ 
          error: 'Failed to create user record', 
          details: insertResult.error.message 
        });
      }

      console.log('User record created after email confirmation:', insertResult.data);

      // Clear auth metadata now that we've transferred data to custom users table
      // NOTE: Due to a known Supabase bug, clearing user_metadata doesn't always work
      // even when the API reports success. This may leave stale display names in auth table.
      // See: https://github.com/supabase/gotrue-js/issues/411
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {}
        });
        if (updateError) {
          console.warn('Failed to clear auth metadata:', updateError);
        } else {
          console.log('Auth metadata cleared for user:', user.id);
        }
      } catch (metadataError) {
        console.warn('Error clearing auth metadata:', metadataError);
      }

      // Send welcome email (non-blocking)
      try {
        const result = await sendWelcomeEmail(
          insertResult.data.email, 
          insertResult.data.first_name
        );
        if (result.success) {
          console.log(`Welcome email sent to ${insertResult.data.email}`);
        } else {
          console.warn(`Welcome email failed for ${insertResult.data.email}:`, result.error);
        }
      } catch (emailError) {
        console.warn('Welcome email service unavailable:', emailError);
      }

      res.json({ 
        success: true, 
        message: 'Email confirmed successfully! You can now sign in.',
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error in email confirmation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User login endpoint - App login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = userLoginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Authenticate with Supabase using auth client
      const { data: authData, error: authError } = await authOperations.signInWithPassword(email, password);

      if (authError || !authData.user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user's email is confirmed
      if (!authData.user.email_confirmed_at) {
        return res.status(401).json({ 
          error: 'Please confirm your email address before signing in',
          details: 'Check your email for the confirmation link'
        });
      }

      // Get user details from our database - handle both old and new schema
      const supabase = getSupabaseRLSBypass();
      
      // Try the new schema first (with first_name, last_name)
      let userResult = await supabase
        .from('users')
        .select('id, email, first_name, last_name, user_type')
        .eq('id', authData.user.id)
        .single();

      // If that fails due to missing columns, try the old schema
      if (userResult.error && userResult.error.code === '42703') {
        console.log('New schema columns not found, trying old schema...');
        userResult = await supabase
          .from('users')
          .select('id, email, user_type')
          .eq('id', authData.user.id)
          .single();
      }

      if (userResult.error || !userResult.data) {
        console.error('User not found in custom users table for ID:', authData.user.id);
        console.error('Database error:', userResult.error);
        return res.status(404).json({ error: 'User not found in database' });
      }

      const user = userResult.data;

      res.json({ 
        success: true, 
        token: authData.session.access_token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          user_type: user.user_type,
          isAdmin: user.user_type === 'admin'
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error in user login:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Password reset endpoint
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = passwordResetSchema.parse(req.body);
      const { email } = validatedData;

      // Use dynamic URL construction to work in both development and production
      const redirectUrl = `${req.protocol}://${req.get('host')}/reset-password`;
      
      // Send password reset email using auth client
      const { error } = await authOperations.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error in password reset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Password update endpoint (for recovery flow)
  app.post('/api/auth/update-password', async (req, res) => {
    try {
      const validatedData = passwordUpdateSchema.parse(req.body);
      const { password } = validatedData;

      // Extract access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      const access_token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the recovery session by getting user info from access token using auth client
      const { data: userData, error: userError } = await authOperations.getUser(access_token);

      if (userError || !userData.user) {
        return res.status(401).json({ error: 'Invalid or expired recovery session' });
      }

      // Update the user's password using admin auth operations
      const { error: updateError } = await adminAuthOperations.updateUserById(
        userData.user.id,
        { password }
      );

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error in password update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Profile update endpoint
  app.post('/api/auth/update-profile', verifyToken, async (req, res) => {
    try {
      const { first_name, last_name } = req.body;
      const userId = (req as any).userId;

      console.log('Profile update request:', { 
        userId, 
        hasUserId: !!userId,
        body: req.body,
        userFromToken: (req as any).user
      });

      // Validate input
      if (!first_name || !last_name) {
        console.log('Profile update validation failed - missing fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!userId) {
        console.log('Profile update failed - no userId from token');
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      // Update user profile in database
      const supabase = getSupabaseRLSBypass();
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      // NOTE: We could also update auth user_metadata here to keep it in sync,
      // but due to Supabase bug where metadata updates don't always persist,
      // we accept that auth metadata may become stale after profile updates.
      // The custom users table above is the authoritative source for user data.

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          user_type: data.user_type,
          isAdmin: data.user_type === 'admin'
        }
      });
    } catch (error) {
      console.error('Error in profile update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user info - requires authentication
  app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      const supabase = getSupabaseRLSBypass();
      
      // Try the new schema first (with first_name, last_name)
      let userResult = await supabase
        .from('users')
        .select('id, email, first_name, last_name, user_type')
        .eq('id', userId)
        .single();

      // If that fails due to missing columns, try the old schema
      if (userResult.error && userResult.error.code === '42703') {
        console.log('New schema columns not found in /api/auth/me, trying old schema...');
        userResult = await supabase
          .from('users')
          .select('id, email, user_type')
          .eq('id', userId)
          .single();
      }

      if (userResult.error || !userResult.data) {
        console.error('User not found in database:', userResult.error);
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.data;

      res.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          user_type: user.user_type,
          isAdmin: user.user_type === 'admin'
        }
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Task Management API - PROTECTED: Requires authentication

  // Create new note
  app.post('/api/notes', verifyToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = createNoteSchema.parse(req.body);
      const { title, content, photo_path } = validatedData;

      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const supabase = getSupabaseRLSBypass();
      const noteResult = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title,
          content,
          photo_path: photo_path || null
        })
        .select()
        .single();

      if (noteResult.error) {
        console.error('Error creating note:', noteResult.error);
        return res.status(500).json({ error: 'Failed to create note', details: noteResult.error.message });
      }

      const note = noteResult.data;

      res.json({ 
        success: true, 
        note: {
          id: note.id,
          user_id: note.user_id,
          title: note.title,
          content: note.content,
          photo_path: note.photo_path,
          created_at: note.created_at,
          updated_at: note.updated_at
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's notes
  app.get('/api/notes', verifyToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      const supabase = getSupabaseRLSBypass();
      const notesResult = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notesResult.error) {
        console.error('Error fetching notes:', notesResult.error);
        return res.status(500).json({ error: 'Failed to fetch notes', details: notesResult.error.message });
      }

      const notes = notesResult.data || [];

      res.json({ 
        success: true, 
        notes: notes.map(note => ({
          id: note.id,
          user_id: note.user_id,
          title: note.title,
          content: note.content,
          photo_path: note.photo_path,
          created_at: note.created_at,
          updated_at: note.updated_at
        }))
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update note (with photo cleanup)
  app.put('/api/notes/:noteId', verifyToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const { noteId } = req.params;
      const validatedData = updateNoteSchema.parse(req.body);
      const { title, content, photo_path } = validatedData;

      const supabase = getSupabaseRLSBypass();
      
      // First get the current note to check existing photo
      const currentNoteResult = await supabase
        .from('notes')
        .select('photo_path')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single();

      if (currentNoteResult.error || !currentNoteResult.data) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const currentNote = currentNoteResult.data;
      const currentPhotoPath = currentNote.photo_path;

      // Handle photo cleanup
      if (currentPhotoPath && 
          (photo_path === null || (photo_path && photo_path !== currentPhotoPath))) {
        // Delete old photo if:
        // 1. Photo is being removed (photo_path is null), OR
        // 2. Photo is being replaced (new photo_path is different from current)
        try {
          console.log(`🗑️ Deleting old photo: ${currentPhotoPath}`);
          await deleteFile('images', currentPhotoPath);
          console.log(`✅ Old photo deleted successfully: ${currentPhotoPath}`);
        } catch (fileError) {
          console.error('Error deleting old photo:', fileError);
          // Continue with update even if file deletion fails
        }
      }
      
      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (photo_path !== undefined) updateData.photo_path = photo_path;

      const noteResult = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (noteResult.error) {
        console.error('Error updating note:', noteResult.error);
        return res.status(500).json({ error: 'Failed to update note', details: noteResult.error.message });
      }

      if (!noteResult.data) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const note = noteResult.data;

      res.json({ 
        success: true, 
        note: {
          id: note.id,
          user_id: note.user_id,
          title: note.title,
          content: note.content,
          photo_path: note.photo_path,
          created_at: note.created_at,
          updated_at: note.updated_at
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.message });
      }
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete note (with file cleanup)
  app.delete('/api/notes/:noteId', verifyToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const { noteId } = req.params;

      // First get the note to check if it has a photo
      const supabase = getSupabaseRLSBypass();
      const noteResult = await supabase
        .from('notes')
        .select('photo_path')
        .eq('user_id', userId)
        .eq('id', noteId)
        .single();

      if (noteResult.error || !noteResult.data) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const note = noteResult.data;
      
      // Delete the file from storage if it exists
      if (note.photo_path) {
        try {
          await deleteFile('images', note.photo_path);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue with note deletion even if file deletion fails
        }
      }

      // Delete the note from database
      const deleteResult = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId)
        .eq('id', noteId);

      res.json({ success: true, message: 'Note and associated files deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Auth routes - PROTECTED: Requires valid JWT token
  app.post('/api/auth/verify-admin', verifyToken, async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const isAdmin = await verifyAdminUser(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      res.json({ success: true, isAdmin: true });
    } catch (error) {
      console.error('Error verifying admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // File storage endpoints
  app.post('/api/upload', verifyToken, async (req: AuthRequest, res) => {
    const uploadStartTime = performance.now();
    console.log(`🕐 UPLOAD START: ${new Date().toISOString()} (${uploadStartTime.toFixed(2)}ms)`);
    
    try {
      if (!req.body.base64Data) {
        return res.status(400).json({ error: 'No file data provided' });
      }

      const { base64Data, fileName, contentType = 'image/jpeg' } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
      // Create truly unique file path with UUID + high precision timestamp
      const uuid = randomUUID();
      const timestamp = Date.now();
      const microseconds = process.hrtime.bigint();
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const filePath = `${userId}/${timestamp}-${uuid.slice(0, 8)}-${microseconds.toString().slice(-6)}.${fileExtension}`;
      
      // Convert base64 to buffer
      console.log(`📤 Upload request: ${fileName}, contentType: ${contentType}`);
      console.log(`📤 Base64 prefix (first 50 chars): ${base64Data.substring(0, 50)}`);
      
      // Handle data URL prefix if present
      let cleanBase64 = base64Data;
      if (base64Data.startsWith('data:')) {
        const base64Index = base64Data.indexOf(',');
        if (base64Index !== -1) {
          cleanBase64 = base64Data.substring(base64Index + 1);
          console.log(`📤 Stripped data URL prefix, clean base64 starts with: ${cleanBase64.substring(0, 20)}`);
        }
      }
      
      const bufferStartTime = performance.now();
      const fileBuffer = Buffer.from(cleanBase64, 'base64');
      const bufferEndTime = performance.now();
      console.log(`📤 Buffer created: ${fileBuffer.length} bytes, first 10: ${Array.from(fileBuffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
      console.log(`🕐 BUFFER CONVERSION: ${(bufferEndTime - bufferStartTime).toFixed(2)}ms`);
      
      // Upload to Supabase storage
      const supabaseStartTime = performance.now();
      console.log(`🕐 SUPABASE UPLOAD START: ${(supabaseStartTime - uploadStartTime).toFixed(2)}ms elapsed`);
      const uploadResult = await uploadFile('images', filePath, fileBuffer, contentType);
      const supabaseEndTime = performance.now();
      console.log(`🕐 SUPABASE UPLOAD END: ${(supabaseEndTime - supabaseStartTime).toFixed(2)}ms duration`);
      console.log(`🕐 SUPABASE UPLOAD TOTAL: ${(supabaseEndTime - uploadStartTime).toFixed(2)}ms elapsed`);
      
      const uploadEndTime = performance.now();
      console.log(`🕐 UPLOAD COMPLETE: ${(uploadEndTime - uploadStartTime).toFixed(2)}ms total duration`);
      
      res.json({
        success: true,
        filePath,
        fileName,
        contentType,
        size: fileBuffer.length
      });
    } catch (error) {
      const uploadErrorTime = performance.now();
      console.error('Upload error:', error);
      console.log(`🕐 UPLOAD ERROR: ${(uploadErrorTime - uploadStartTime).toFixed(2)}ms before error`);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  app.get('/api/file/:bucket/:path(*)', verifyToken, async (req: AuthRequest, res) => {
    const downloadStartTime = performance.now();
    console.log(`🕐 DOWNLOAD START: ${new Date().toISOString()} (${downloadStartTime.toFixed(2)}ms)`);
    
    try {
      const { bucket, path } = req.params;
      const userId = req.user?.id;
      
      console.log(`📥 File request: bucket=${bucket}, path=${path}, userId=${userId}`);
      console.log(`📥 Full request URL: ${req.url}`);
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify user owns this file (path should start with userId)
      if (!path.startsWith(userId)) {
        console.log(`❌ Access denied: path ${path} does not start with userId ${userId}`);
        return res.status(403).json({ error: 'Access denied' });
      }

      // Download the file data from Supabase Storage
      const supabaseDownloadStartTime = performance.now();
      console.log(`⬇️ Downloading from Supabase: ${bucket}/${path}`);
      console.log(`🕐 SUPABASE DOWNLOAD START: ${(supabaseDownloadStartTime - downloadStartTime).toFixed(2)}ms elapsed`);
      const fileData = await downloadFile(bucket, path);
      const supabaseDownloadEndTime = performance.now();
      console.log(`🕐 SUPABASE DOWNLOAD END: ${(supabaseDownloadEndTime - supabaseDownloadStartTime).toFixed(2)}ms duration`);
      
      if (!fileData) {
        console.log(`❌ File not found in Supabase: ${bucket}/${path}`);
        return res.status(404).json({ error: 'File not found' });
      }

      // Detect content type from file extension
      const getContentType = (filePath: string): string => {
        const extension = filePath.toLowerCase().split('.').pop();
        console.log(`🔍 Detected extension: ${extension} from path: ${filePath}`);
        switch (extension) {
          case 'png': return 'image/png';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'gif': return 'image/gif';
          case 'webp': return 'image/webp';
          case 'svg': return 'image/svg+xml';
          default: return 'image/jpeg'; // fallback
        }
      };

      // Set appropriate headers for image response
      const contentType = getContentType(path);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
      res.setHeader('Content-Length', fileData.size);
      
      console.log(`✅ Serving image: ${path} as ${contentType} (${fileData.size} bytes)`);
      
      // Convert blob to buffer and send
      const bufferConversionStartTime = performance.now();
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const bufferConversionEndTime = performance.now();
      console.log(`🕐 BUFFER CONVERSION: ${(bufferConversionEndTime - bufferConversionStartTime).toFixed(2)}ms duration`);
      
      console.log(`📤 Sending buffer: ${buffer.length} bytes, first 10 bytes: ${Array.from(buffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
      
      const downloadEndTime = performance.now();
      console.log(`🕐 DOWNLOAD COMPLETE: ${(downloadEndTime - downloadStartTime).toFixed(2)}ms total duration`);
      
      res.send(buffer);
    } catch (error) {
      const downloadErrorTime = performance.now();
      console.error('❌ File access error:', error);
      console.log(`🕐 DOWNLOAD ERROR: ${(downloadErrorTime - downloadStartTime).toFixed(2)}ms before error`);
      res.status(500).json({ error: 'Failed to access file' });
    }
  });

  app.delete('/api/file/:bucket/:path(*)', verifyToken, async (req: AuthRequest, res) => {
    try {
      const { bucket, path } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify user owns this file
      if (!path.startsWith(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await deleteFile(bucket, path);
      
      res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Debug endpoint for testing token expiration (development only)
  app.post('/api/debug/set-token-expiry', verifyToken, async (req: AuthRequest, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    try {
      const { expirySeconds = 30 } = req.body; // Default to 30 seconds for quick testing
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log(`🔧 Debug: Token expiry test requested for user ${userId}, duration: ${expirySeconds} seconds`);
      
      res.json({ 
        success: true, 
        message: `Token invalidated. Session will expire immediately for testing purposes.`,
        expirySeconds: expirySeconds,
        userId: userId
      });
    } catch (error) {
      console.error('Debug token expiry error:', error);
      res.status(500).json({ error: 'Failed to set token expiry' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
