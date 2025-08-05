import { supabaseAdmin, getUserById, createUser } from './lib/supabase';
import { User, InsertUser } from '@shared/schema';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await getUserById(id);
    if (error || !data) {
      return undefined;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return undefined;
    }
    return data as User;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return undefined;
    }
    return data as User;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }
}

export const storage = new SupabaseStorage();
