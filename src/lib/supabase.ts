import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both VITE_SUPABASE_URL and typo VITE_SUPABASE_UR mentioned by user
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_UR as string | undefined) ||
  '';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (isSupabaseConfigured) {
  console.log('Supabase client initialized successfully with project URL:', supabaseUrl);
} else {
  console.info('Supabase credentials not fully detected. Local storage & offline database active.');
}
