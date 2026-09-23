import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('https://') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('your-project')
  );
};

// Safe client instance (will connect if configured, or remain null-safe)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Trigger real Google OAuth sign-in via Supabase.
 * Redirects the browser to Google's consent screen.
 */
export async function signInWithGoogleOAuth(redirectTo?: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const targetRedirect = redirectTo || origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out user from Supabase session
 */
export async function signOutFromSupabase() {
  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase sign-out warning:', error.message);
    } catch (err) {
      console.warn('Supabase sign-out failed:', err);
    }
  }
}

/**
 * Retrieve current active Supabase session
 */
export async function getSupabaseSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

