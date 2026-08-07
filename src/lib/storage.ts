import { createClient } from '@supabase/supabase-js';

// Captura as chaves do ambiente Vite de forma segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezpytjuamjbbihlmexxw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jzzv-CHLz8xZwOcyj6Z4Ag_Q5H3pA1m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
