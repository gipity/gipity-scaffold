import { z } from "zod";



// User schema for Supabase (extended for app)
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  user_type: z.enum(['user', 'admin']).default('user'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const insertUserSchema = userSchema.pick({
  email: true,
  first_name: true,
  last_name: true,
  user_type: true,

});

export const updateUserSchema = insertUserSchema.partial();

// User registration schema (for frontend signup) - clean scaffold version
export const userRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required")
});

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

// Password update schema (for recovery flow)
export const passwordUpdateSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;

export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type PasswordUpdate = z.infer<typeof passwordUpdateSchema>;



// Note schema for app
export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, "Note title is required").max(100, "Title too long"),
  content: z.string().min(1, "Note content is required").max(1000, "Content too long"),
  photo_path: z.string().nullable().optional(), // Path to uploaded photo in Supabase storage
  photo_url: z.string().optional(), // Signed URL for photo access (not stored, generated on request)
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const insertNoteSchema = noteSchema.pick({
  user_id: true,
  title: true,
  content: true,
  photo_path: true
});

export const updateNoteSchema = noteSchema.pick({
  title: true,
  content: true,
  photo_path: true
}).partial();

// Note creation schema (for frontend)
export const createNoteSchema = z.object({
  title: z.string().min(1, "Note title is required").max(100, "Title too long"),
  content: z.string().min(1, "Note content is required").max(1000, "Content too long"),
  photo_path: z.string().optional()
});

export type Note = z.infer<typeof noteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
export type CreateNote = z.infer<typeof createNoteSchema>;


