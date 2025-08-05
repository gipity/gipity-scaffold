import { createClient } from '@supabase/supabase-js';
import { debug } from './debug';
import { supabaseAdmin } from './supabase';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables for auth client');
}

// Dedicated auth client using anon key for sessionless authentication operations
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sessionless authentication functions using anon key client
export const authOperations = {
  // User registration with email confirmation
  signUp: async (email: string, password: string, options?: any) => {
    return await supabaseAuth.auth.signUp({
      email,
      password,
      options
    });
  },

  // User login
  signInWithPassword: async (email: string, password: string) => {
    return await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });
  },

  // Get user from access token (for email confirmation)
  getUser: async (accessToken: string) => {
    return await supabaseAuth.auth.getUser(accessToken);
  },

  // Password reset request
  resetPasswordForEmail: async (email: string, options?: any) => {
    return await supabaseAuth.auth.resetPasswordForEmail(email, options);
  },

  // Verify OTP
  verifyOtp: async (params: any) => {
    return await supabaseAuth.auth.verifyOtp(params);
  },

  // Resend confirmation
  resend: async (params: any) => {
    return await supabaseAuth.auth.resend(params);
  }
};

// Admin operations that still need the admin client (for user management)
export const adminAuthOperations = {
  // Create user (admin only)
  createUser: async (email: string, password: string, userType: 'user' | 'admin' = 'user') => {
    return await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
  },

  // Update user password (admin only)
  updateUserById: async (userId: string, updates: any) => {
    return await supabaseAdmin.auth.admin.updateUserById(userId, updates);
  },

  // Create user with database record (admin only)
  createUserWithRecord: async (email: string, password: string, userType: 'user' | 'admin' = 'user') => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      throw error;
    }

    // Insert user record in users table using admin client
    if (data.user) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          user_type: userType
        });

      if (insertError) {
        debug.error('Error inserting user record:', insertError);
      }
    }

    return data;
  }
};