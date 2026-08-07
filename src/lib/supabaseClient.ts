import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://sqnlvnrcxeiiahbaxtlr.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xc9PxGlHMVbfgvORERshTw_pH1qTMlZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isSupabaseConfigured = (): boolean => {
  return (
    !!metaEnv.VITE_SUPABASE_URL &&
    metaEnv.VITE_SUPABASE_URL !== 'https://sqnlvnrcxeiiahbaxtlr.supabase.co'
  );
};
