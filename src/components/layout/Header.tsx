import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Shield, 
  Moon, 
  Sun, 
  Database,
  Menu,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Settings
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../../types';
import { getNotifications, markNotificationRead } from '../../lib/storage';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenSearch: () => void;
  onNavigate: (view: string) => void;
  onOpenSqlModal: () => void;
  onOpenNotificationSettings?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleSidebar: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSearch,
  onNavigate,
  onOpenSqlModal,
  onOpenNotificationSettings,
  darkMode,
  setDarkMode,
  toggleSidebar,
  activeView
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string, linkUrl?: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
    setNotificationsOpen(false);
    if (linkUrl) {
      const view = linkUrl.replace('#', '');
      if (view) onNavigate(view);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors shadow-sm">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            id="btn-toggle-sidebar"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Alternar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center font-bold text-white text-lg shadow-sm group-hover:bg-blue-800 transition">
              U
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl tracking-tight text-blue-900 dark:text-blue-400">
                UNICCAT
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-none">
                Medicina & Segurança do Trabalho
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar Trigger */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <button
            onClick={onOpenSearch}
            id="btn-global-search-trigger"
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-transparent rounded-lg text-slate-600 dark:text-slate-300 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-400">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline font-normal text-slate-500 dark:text-slate-400">Pesquisa global de arquivos, pessoas e links...</span>
              <span className="md:hidden font-normal text-slate-500">Pesquisar...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 rounded">
              <span>⌘</span><span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SQL Schema button for Admins */}
          <button
            onClick={onOpenSqlModal}
            id="btn-sql-schema-trigger"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
            title="Ver e Exportar Banco de Dados Supabase (SQL)"
          >
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Supabase SQL</span>
          </button>

          {/* Direct Chat Button */}
          <button
            onClick={() => onNavigate('chat')}
            id="btn-header-chat"
            className={`p-2 rounded-lg transition relative ${
              activeView === 'chat'
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
            title="Chat Corporativo Realtime"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            id="btn-theme-toggle"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition"
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              id="btn-notifications-toggle"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-200">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Notificações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{unreadCount} não lidas</span>
                    {onOpenNotificationSettings && (
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          onOpenNotificationSettings();
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 transition"
                        title="Configurações de Notificação"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id, n.linkUrl)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition flex items-start gap-3 ${
                          !n.read ? 'bg-blue-50/50 dark:bg-slate-800/40 border-l-2 border-blue-600' : 'opacity-75'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          {!n.read ? <Bell className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              id="btn-user-profile-menu"
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition border border-transparent"
            >
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-200">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-[10px] font-semibold">
                      {currentUser.role} • {currentUser.department}
                    </span>
                  </div>
                </div>

                <div className="p-2 text-xs space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition ${
                      activeView === 'profile' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium' : ''
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Meu Perfil</span>
                  </button>

                  {(currentUser.role === 'Administrador' || currentUser.role === 'RH') && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition ${
                        activeView === 'admin' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium' : ''
                      }`}
                    >
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Painel Administrativo & RH</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenSqlModal();
                      setUserMenuOpen(false);
                    }}
                    className="w-full lg:hidden flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                  >
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Script SQL Supabase</span>
                  </button>
                </div>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={onLogout}
                    id="btn-logout"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
