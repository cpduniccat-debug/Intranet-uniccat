export const UNICCAT_SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- UNICCAT INTRANET CORPORATIVA - SCHEMA COMPLETO DO BANCO DE DADOS SUPABASE
-- Medicina e Segurança do Trabalho
-- ==============================================================================

-- 1. HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS E ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
      'Administrador', 'RH', 'Financeiro', 'Comercial', 
      'Recepção', 'Médico', 'Coordenador', 'Gestor', 'Funcionário'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM (
      'Diretoria', 'Medicina Ocupacional', 'Segurança do Trabalho',
      'Recursos Humanos', 'Financeiro & Administrativo', 'Comercial',
      'Recepção & Atendimento', 'Tecnologia da Informação', 'Qualidade & Processos'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE announcement_priority AS ENUM ('Urgente', 'Alta', 'Normal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABELA DE PERFIS DE USUÁRIOS (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'Funcionário',
  department department_type NOT NULL DEFAULT 'Recursos Humanos',
  phone TEXT,
  extension TEXT, -- Ramal interno
  mobile TEXT,
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  birth_date DATE,
  hire_date DATE,
  bio TEXT,
  location TEXT DEFAULT 'Unidade Matriz',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE COMUNICADOS DO RH
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  priority announcement_priority DEFAULT 'Normal',
  pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_photo_url TEXT,
  cover_image TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  publish_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE,
  allow_comments BOOLEAN DEFAULT true,
  requires_read_confirmation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONFIRMAÇÕES DE LEITURA DE COMUNICADOS
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- 6. COMENTÁRIOS DE COMUNICADOS
CREATE TABLE IF NOT EXISTS public.announcement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LINKS RÁPIDOS
CREATE TABLE IF NOT EXISTS public.quick_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Globe',
  category TEXT DEFAULT 'Portais',
  is_official BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  open_in_new_tab BOOLEAN DEFAULT true,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BIBLIOTECA DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  download_url TEXT NOT NULL,
  author_name TEXT NOT NULL,
  department department_type NOT NULL,
  version TEXT DEFAULT 'v1.0',
  downloads_count INT DEFAULT 0,
  mandatory_reading BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONFIRMAÇÕES DE LEITURA OBRIGATÓRIA DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.document_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- 10. CALENDÁRIO CORPORATIVO & EVENTOS
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  event_time TIME,
  location TEXT,
  organizer TEXT NOT NULL,
  department department_type,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CHAMADOS INTERNOS / HELPDESK
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Média',
  status TEXT NOT NULL DEFAULT 'Aberto',
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RESERVAS DE RECURSOS (Salas e Veículos)
CREATE TABLE IF NOT EXISTS public.resource_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reserved_by_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'Confirmado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. LOGS DE AUDITORIA E SEGURANÇA
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABELAS DO CHAT CORPORATIVO & SUPABASE REALTIME
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  participant_ids UUID[] NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_photo_url TEXT,
  sender_role TEXT,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_presences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  custom_status TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enable_browser_push BOOLEAN DEFAULT true,
  enable_sound BOOLEAN DEFAULT true,
  enable_in_app_toast BOOLEAN DEFAULT true,
  category_announcements BOOLEAN DEFAULT true,
  category_birthdays BOOLEAN DEFAULT true,
  category_chat BOOLEAN DEFAULT true,
  category_tickets BOOLEAN DEFAULT true,
  category_calendar BOOLEAN DEFAULT true,
  category_critical BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. SEGURANÇA & POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE CHAT E MENSAGENS REALTIME
CREATE POLICY "Participantes podem ler salas de chat" ON public.chat_rooms
  FOR SELECT TO authenticated USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Usuários autenticados podem criar salas de chat" ON public.chat_rooms
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Participantes podem ler mensagens da sala" ON public.chat_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = chat_messages.room_id AND auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Participantes podem enviar mensagens" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = chat_messages.room_id AND auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Todos os usuários autenticados podem ver presença" ON public.user_presences
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários gerenciam sua própria presença" ON public.user_presences
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- HABILITAR PUBLICAÇÃO REALTIME SUPABASE
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presences;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN OTHERS THEN null; END $$;

-- POLÍTICAS DE PERFIL
CREATE POLICY "Usuários autenticados podem ler perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Administradores e RH podem gerenciar todos os perfis" ON public.profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Administrador', 'RH')
    )
  );

-- POLÍTICAS DE COMUNICADOS
CREATE POLICY "Todos podem ler comunicados ativos" ON public.announcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas RH e Admins podem criar e editar comunicados" ON public.announcements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Administrador', 'RH')
    )
  );

-- POLÍTICAS DE LINKS RÁPIDOS E DOCUMENTOS
CREATE POLICY "Todos podem visualizar links rápidos" ON public.quick_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem visualizar documentos" ON public.documents
  FOR SELECT TO authenticated USING (true);

-- DADOS INICIAIS (SEED)
INSERT INTO public.quick_links (title, description, url, icon_name, category, is_official, order_index, badge)
VALUES
('Site Institucional', 'Portal oficial da UNICCAT Medicina do Trabalho', 'https://www.uniccat.com.br', 'Globe', 'Portais', true, 1, 'Oficial'),
('Infomed', 'Sistema de Gestão Médica Ocupacional', 'http://192.168.0.7/infomed/', 'Activity', 'Sistemas Internos', true, 2, 'Rede Local'),
('MedClinic', 'Plataforma de Atendimento e Laudos Médicos', 'http://192.168.0.49/medclinic_uniccat/comum/login.php', 'Stethoscope', 'Sistemas Internos', true, 3, 'Rede Local'),
('Webmail UNICCAT', 'Acesso ao E-mail Corporativo', 'https://webmail.uniccat.com.br/', 'Mail', 'Ferramentas', true, 4, 'E-mail'),
('Assistente.net', 'Plataforma Integrada de Documentos e eSocial', 'https://plataforma.assistente.net.br/auth/login', 'FileCheck', 'Sistemas Internos', true, 5, 'eSocial'),
('Secullum Ponto Web', 'Registro de Ponto Eletrônico', 'https://autenticador.secullum.com.br/Authorization?client_id=3001&response_type=code&redirect_uri=https%3A%2F%2Fpontoweb.secullum.com.br%2FAuth', 'Clock', 'RH', true, 6, 'Ponto')
ON CONFLICT DO NOTHING;
`;
