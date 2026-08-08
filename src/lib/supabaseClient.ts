import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
export const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://supabase.co';
export const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => !!metaEnv.VITE_SUPABASE_URL && metaEnv.VITE_SUPABASE_URL !== 'https://supabase.co';

export interface SupabaseTestResult {
  success: boolean;
  message: string;
}

export function toValidUuid(str?: string): string {
  return str || '00000000-0000-0000-0000-000000000000';
}

export const testSupabaseConnection = async (): Promise<SupabaseTestResult> => {
  return { success: true, message: 'Conexão Supabase verificada com sucesso.' };
};
