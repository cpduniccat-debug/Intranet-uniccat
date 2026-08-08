import React, { useState, useEffect } from 'react';
import { Announcement } from './types';
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
import { CalendarCheck, HelpCircle } from 'lucide-react';
import { supabase, toValidUuid } from './lib/supabaseClient';
import { saveUser } from './lib/storage';

export default function App() {
  const [currentUser, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [notifSettingsModalOpen, setNotifSettingsModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    id: string;
    title: string;
    message: string;
    type?: string;
    linkView?: string;
  } | null>(null);

  const fetchUserProfile = async (supabaseUser: any) => {
    if (!supabaseUser) return;
    
    const userEmail = (supabaseUser.email || 'usuario@uniccat.com.br').toLowerCase();
    const defaultName = supabaseUser.name || supabaseUser.user_metadata?.name || userEmail.split('@')[0].replace('.', ' ').toUpperCase();
    
    const validRoles = ['Administrador', 'RH', 'Financeiro', 'Comercial', 'Recepção', 'Médico', 'Coordenador', 'Gestor', 'Funcionário'];
    let defaultRole = 'Administrador';
    
    if (validRoles.includes(supabaseUser.user_metadata?.role)) {
      defaultRole = supabaseUser.user_metadata.role;
    } else if (validRoles.includes(supabaseUser.role) && supabaseUser.role !== 'authenticated' && supabaseUser.role !== 'USER') {
      defaultRole = supabaseUser.role;
    }
    
    const baseUser = {
      id: supabaseUser.id || ('u-' + Date.now()),
      email: userEmail,
      name: defaultName,
      role: defaultRole,
      department: supabaseUser.department || 'Tecnologia da Informação',
      ramal: supabaseUser.ramal || supabaseUser.extension || '100',
      active: true,
      photoUrl: supabaseUser.photoUrl || supabaseUser.user_metadata?.avatar_url || null
    };

    setUser(baseUser);

    try {
      if (supabaseUser.id || userEmail) {
        let query = supabase.from('profiles').select('*');
        if (supabaseUser.id && supabaseUser.id.length > 20) {
          query = query.or(`id.eq.${supabaseUser.id},email.eq.${userEmail}`);
        } else {
          query = query.eq('email', userEmail);
        }

        const { data, error } = await query.maybeSingle();

        if (data && !error) {
          const finalRole = validRoles.includes(data.role) ? data.role : defaultRole;
          const activeUser = {
            id: supabaseUser.id || data.id,
            email: userEmail,
            name: data.name || baseUser.name,
            role: finalRole,
            department: data.department || baseUser.department,
            ramal: data.extension || data.ramal || baseUser.ramal,
            photoUrl: data.photo_url || baseUser.photoUrl,
            active: data.active ?? true
          };
          setUser(activeUser);
          saveUser(activeUser);
        } else {
          // Record profile in Supabase table
          const profileRow = {
            id: toValidUuid(supabaseUser.id),
            name: baseUser.name,
            email: userEmail,
            role: baseUser.role,
            department: baseUser.department,
            extension: baseUser.ramal,
            active: true,
            location: 'Sede Principal - SP'
          };
          Promise.resolve(
            supabase.from('profiles').upsert(profileRow, { onConflict: 'email' })
          ).catch(console.error);
          saveUser(baseUser);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar perfil no Supabase:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
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
    fetchUserProfile(supabaseUser);
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          currentUser={currentUser}
          isOpen={sidebarOpen}
        />

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

          {activeView === 'quicklinks' && <QuickLinksView currentUser={currentUser} />}
          {activeView === 'documents' && <DocumentLibraryView currentUser={currentUser} />}
          {activeView === 'calendar' && <CalendarView currentUser={currentUser} />}
          {activeView === 'phonebook' && <PhoneBookView currentUser={currentUser} />}
          {activeView === 'chat' && <ChatView currentUser={currentUser} />}
          {activeView === 'tickets' && <TicketsView currentUser={currentUser} />}
          {activeView === 'hrportal' && <HrPortalView currentUser={currentUser} />}
          {activeView === 'polls' && <PollsView currentUser={currentUser} />}
          {activeView === 'profile' && <ProfileView currentUser={currentUser} />}
          {activeView === 'admin' && <AdminView currentUser={currentUser} />}

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

      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          currentUser={currentUser}
          onRefresh={() => {}}
        />
      )}

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(view) => setActiveView(view)}
      />

      <SqlSchemaModal
        isOpen={sqlModalOpen}
        onClose={() => setSqlModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={notifSettingsModalOpen}
        onClose={() => setNotifSettingsModalOpen(false)}
        currentUser={currentUser}
      />

      {toast && (
        <div 
          onClick={() => { if(toast.linkView) setActiveView(toast.linkView); setToast(null); }}
          className="fixed bottom-5 right-5 z-50 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl cursor-pointer hover:scale-105 transition max-w-sm"
        >
          <p className="font-bold text-sm text-blue-900 dark:text-blue-400">{toast.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
