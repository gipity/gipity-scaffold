import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Shared RLS-bypass client for all server operations
let supabaseRLS: SupabaseClient | null = null;

export const getSupabaseRLSBypass = (): SupabaseClient => {
  if (!supabaseRLS) {
    supabaseRLS = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );
  }
  return supabaseRLS;
};

// Utility functions for common database operations
export const dbUtils = {
  // Get user by ID (bypasses RLS)
  async getUserById(userId: string) {
    const supabase = getSupabaseRLSBypass();
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  },

  // Check if user is admin (bypasses RLS)
  async isAdmin(userId: string): Promise<boolean> {
    const supabase = getSupabaseRLSBypass();
    const { data, error } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    if (error || !data) return false;
    return data.user_type === 'admin';
  },

  // Get all users (admin only, bypasses RLS)
  async getAllUsers() {
    const supabase = getSupabaseRLSBypass();
    return await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
  },

  // Create user (bypasses RLS)
  async createUser(userData: any) {
    const supabase = getSupabaseRLSBypass();
    return await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
  },

  // Update user (bypasses RLS)
  async updateUser(userId: string, updates: any) {
    const supabase = getSupabaseRLSBypass();
    return await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
  },

  // Table query builder (for Supabase operations)
  table(tableName: string) {
    const supabase = getSupabaseRLSBypass();
    return supabase.from(tableName);
  }
};