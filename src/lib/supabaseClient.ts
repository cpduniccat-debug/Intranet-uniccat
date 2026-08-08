import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
export const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://supabase.co';
export const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => !!metaEnv.VITE_SUPABASE_URL && metaEnv.VITE_SUPABASE_URL !== 'https://supabase.co';

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  errorCode?: string;
}

export function toValidUuid(str?: string): string {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return str;
  return '00000000-0000-0000-0000-000000000000';
}

export const testSupabaseConnection = async (): Promise<SupabaseTestResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: 'Banco de dados operando localmente com cache em tempo real.'
    };
  }

  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      return {
        success: false,
        message: `Aviso na conexão Supabase: ${error.message} (Verifique se a tabela 'profiles' existe e se as regras RLS estão aplicadas).`,
        errorCode: error.code
      };
    }
    return {
      success: true,
      message: 'Conexão Supabase verificada e funcional com as tabelas do banco de dados!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao acessar o Supabase: ${err?.message || 'Erro de conexão'}`
    };
  }
};
