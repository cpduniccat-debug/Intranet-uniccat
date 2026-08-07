import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
export const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://ezpytjuamjbbihlmexxw.supabase.co';
export const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jzzv-CHLz8xZwOcyj6Z4Ag_Q5H3pA1m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

export function toValidUuid(str?: string): string {
  if (!str) return '00000000-0000-4000-8000-000000000001';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex.slice(0, 12).padStart(12, '0')}`;
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  details?: any;
  errorCode?: string;
}

export const testSupabaseConnection = async (): Promise<SupabaseTestResult> => {
  try {
    // Try to write and then delete a test entry in audit_logs or check profiles table
    const { data, error } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Check error code
      if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('API key')) {
        return {
          success: false,
          message: 'Chave de API (Anon Key) ou URL do Supabase inválida.',
          errorCode: error.code,
          details: error
        };
      }
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Tabelas do banco não encontradas. É necessário rodar o script SQL de criação de tabelas no Supabase.',
          errorCode: error.code,
          details: error
        };
      }
      if (error.code === '42501' || error.message.includes('row-level security')) {
        return {
          success: false,
          message: 'Política RLS (Row Level Security) bloqueou o acesso. Execute o script de permissões públicas no Supabase.',
          errorCode: error.code,
          details: error
        };
      }
      return {
        success: false,
        message: `Erro do Supabase (${error.code || 'Desconhecido'}): ${error.message}`,
        errorCode: error.code,
        details: error
      };
    }

    // Try a test write operation with valid UUID
    const testId = toValidUuid('test-' + Date.now());
    const { error: writeError } = await supabase.from('audit_logs').insert([
      {
        id: testId,
        user_name: 'Teste de Conexão',
        action: 'TESTE_CONEXAO',
        details: 'Verificação de permissão de gravação no Supabase',
        ip_address: '127.0.0.1'
      }
    ]);

    if (writeError) {
      if (writeError.code === '42501' || writeError.message.includes('row-level security') || writeError.message.includes('permission denied')) {
        return {
          success: false,
          message: 'O Supabase está conectado para LEITURA, mas a ESCRITA foi BLOQUEADA pelas Políticas de RLS (Row Level Security).',
          errorCode: writeError.code,
          details: writeError
        };
      }
      if (writeError.code === '42P01') {
        return {
          success: false,
          message: 'A tabela "audit_logs" não existe no Supabase. Crie as tabelas executando o script SQL.',
          errorCode: writeError.code,
          details: writeError
        };
      }
      if (writeError.code === '23503') {
        return {
          success: false,
          message: 'Restrição de Chave Estrangeira do Supabase detectada (23503). Execute o script de desbloqueio para liberar os registros.',
          errorCode: writeError.code,
          details: writeError
        };
      }
      return {
        success: false,
        message: `A gravação falhou (${writeError.code}): ${writeError.message}`,
        errorCode: writeError.code,
        details: writeError
      };
    }

    // Clean up test entry
    await supabase.from('audit_logs').delete().eq('id', testId);

    return {
      success: true,
      message: 'Conexão e Permissão de Gravação no Supabase VERIFICADAS COM SUCESSO! Leitura e Escrita ativas.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro na tentativa de conexão: ${err.message || err}`,
      details: err
    };
  }
};

