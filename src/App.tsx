import React, { useState, useEffect } from 'react';
import { UserProfile, Announcement } from './types';
import { getUsers, getNotifications, getCurrentUser, setCurrentUser } from './lib/storage';
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

export default function App() {
  const [currentUser, setUser] = useState<UserProfile | null>(() => {
    return getCurrentUser() || getUsers()[0];
  });
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

  useEffect(() => {
    const handleChatMsg = (e: any) => {
      const { message, room } = e.detail;
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

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null as any);
    setUser(null);
  };

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

          {/* Secondary Views (Tickets, Bookings, HR Portal, Wiki, OrgChart, Profile, Admin) */}
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
                    <p className="text-xs text-slate-500">Agende salas de reunião, audiórios e veículos da UNICCAT</p>
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

          {activeView === 'orgchart' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl">
                    <Network className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Organograma UNICCAT</h1>
                    <p className="text-xs text-slate-500">Estrutura organizacional, diretorias, gerências e coordenações</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'profile' && currentUser && (
            <ProfileView
              currentUser={currentUser}
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
              }}
            />
          )}

          {activeView === 'admin' && (
            <AdminView
              currentUser={currentUser}
              onOpenSqlModal={() => setSqlModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        currentUser={currentUser}
        onRefresh={handleRefresh}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(v) => setActiveView(v)}
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

      {/* Realtime Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div 
            onClick={() => {
              if (toast.linkView) setActiveView(toast.linkView);
              setToast(null);
            }}
            className="p-4 bg-slate-900 border border-blue-500/50 text-white rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm cursor-pointer hover:bg-slate-800 transition"
          >
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-blue-300">{toast.title}</p>
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
