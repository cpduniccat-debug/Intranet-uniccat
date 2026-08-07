import React, { useState, useEffect } from 'react';
import { Announcement } from './types';
import { getNotifications } from './lib/storage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { QuickLinksView } from './components/views/QuickLinksView';
import { DocumentLibraryView } from './components/views/DocumentLibraryView';
import { CalendarView } from './components/views/CalendarView';
import { PhoneBookView } from './components/views/PhoneBookView';
import { ChatView } from './components/views/ChatView';
import { AdminView } from './components/views/AdminView';
import { TicketsView } from './components/views/TicketsView';
import { ProfileView } from './components/views/ProfileView';
import { HrPortalView } from './components/views/HrPortalView';
import { PollsView } from './components/views/PollsView';

import { AnnouncementDetailModal } from './components/modals/AnnouncementDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { SqlSchemaModal } from './components/modals/SqlSchemaModal';
import { NotificationSettingsModal } from './components/modals/NotificationSettingsModal';
import { 
  LifeBuoy, 
  CalendarCheck, 
  UserCheck, 
  Vote, 
  HelpCircle, 
  Network, 
  ShieldCheck, 
  User as UserIcon,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  // Alterado para gerenciar o estado dinâmico do usuário vindo do Supabase
  const [currentUser, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [notifSettingsModalOpen, setNotifSettingsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Floating Toast State for Push Notifications
  const [toast, setToast] = useState<{
    id: string;
    title: string;
    message: string;
    type?: string;
    linkView?: string;
  } | null>(null);

  // Verifica persistência de sessão ativa ao carregar a aplicação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Adapta propriedades essenciais legadas que a UI espera usando os dados do Supabase
        setUser({
          ...session.user,
          name: session.user.email?.split('@')[0], // Nome amigável temporário
          role: 'ADMIN', // Nível de acesso temporário padrão para testes de tela
        });
      }
      setLoading(false);
    });

    // Escuta mudanças de estado na autenticação (Sign In / Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.email?.split('@')[0],
          role: 'ADMIN',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleChatMsg = (e: any) => {
      const { message } = e.detail;
      if (message.senderId !== currentUser?.id) {
        setToast({
          id: 'toast-' + Date.now(),
          title: `💬 Mensagem de ${message.senderName}`,
          message: message.content || 'Enviou um anexo.',
          linkView: 'chat'
        });
      }
    };

    window.addEventListener('uniccat_chat_msg', handleChatMsg);
    return () => window.removeEventListener('uniccat_chat_msg', handleChatMsg);
  }, [currentUser?.id]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLoginSuccess = (supabaseUser: any) => {
    setUser({
      ...supabaseUser,
      name: supabaseUser.email?.split('@')[0],
      role: 'ADMIN',
    });
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Exibe tela de carregamento sutil para evitar piscar o login na tela
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenSqlModal={() => setSqlModalOpen(true)}
        onOpenNotificationSettings={() => setNotifSettingsModalOpen(true)}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={(view) => setActiveView(view)}
        activeView={activeView}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          currentUser={currentUser}
          isOpen={sidebarOpen}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 min-h-[calc(100vh-4rem)]">
          {activeView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              onSelectAnnouncement={(a) => setSelectedAnnouncement(a)}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'announcements' && (
            <AnnouncementsView
              currentUser={currentUser}
              onSelectAnnouncement={(a) => setSelectedAnnouncement(a)}
            />
          )}

          {activeView === 'quicklinks' && (
            <QuickLinksView
              currentUser={currentUser}
            />
          )}

          {activeView === 'documents' && (
            <DocumentLibraryView
              currentUser={currentUser}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              currentUser={currentUser}
            />
          )}

          {activeView === 'phonebook' && (
            <PhoneBookView
              currentUser={currentUser}
            />
          )}

          {activeView === 'chat' && (
            <ChatView
              currentUser={currentUser}
            />
          )}

          {activeView === 'tickets' && (
            <TicketsView currentUser={currentUser} />
          )}

          {activeView === 'bookings' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Reserva de Salas e Veículos Corporativos</h1>
                    <p className="text-xs text-slate-500">Agende salas de reunião, auditórios e veículos da UNICCAT</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'hrportal' && (
            <HrPortalView currentUser={currentUser} />
          )}

          {activeView === 'polls' && (
            <PollsView currentUser={currentUser} />
          )}

          {activeView === 'wiki' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Base de Conhecimento & Procedimentos Operacionais (POP)</h1>
                    <p className="text-xs text-slate-500">Manuais normativos, diretrizes de segurança do trabalho e boas práticas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
