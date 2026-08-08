import { createClient } from '@supabase/supabase-js';

// Captura as chaves do ambiente Vite de forma segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Inicializa a instância oficial do cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adicionado: Flag requerida pelo ChatView para habilitar a interface em produção
export const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://supabase.co';
