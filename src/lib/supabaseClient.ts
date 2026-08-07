import { createClient } from '@supabase/supabase-js';

// Substitua diretamente as strings abaixo com as credenciais do seu painel do Supabase
const supabaseUrl = 'https://ezpytjuamjbbihlmexxw.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_jzzv-CHLz8xZwOcyj6Z4Ag_Q5H3pA1m';

if (supabaseUrl.includes('seu-projeto-id')) {
  console.error('Atenção: Você precisa colar as chaves reais do seu projeto Supabase no arquivo supabaseClient.ts!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
