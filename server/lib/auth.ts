import { Request, Response, NextFunction } from 'express';
import { getSupabaseRLSBypass } from './database';
import { authOperations } from './supabase-auth';
import { debug } from './debug';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    user_type: 'user' | 'admin';
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Use auth client for token verification
    const { data: { user }, error } = await authOperations.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user details from database using admin client for database operations
    const supabase = getSupabaseRLSBypass();
    const userResult = await supabase
      .from('users')
      .select('id, email, user_type')
      .eq('id', user.id)
      .single();

    if (userResult.error || !userResult.data) {
      debug.error('User not found in database:', userResult.error);
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email!,
      user_type: userResult.data.user_type
    };

    next();
  } catch (error) {
    debug.error('Auth verification error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

export const verifyAdminUser = async (userId: string): Promise<boolean> => {
  try {
    const { dbUtils } = await import('./database');
    return await dbUtils.isAdmin(userId);
  } catch (error) {
    debug.error('Error verifying admin user:', error);
    return false;
  }
};
