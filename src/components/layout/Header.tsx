import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  User, 
  Database,
  Settings,
  Moon,
  Sun
} from 'lucide-react';

interface HeaderProps {
  currentUser: any; // Ajustado para ser compatível com o Supabase dinâmico
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenSqlModal: () => void;
  onOpenNotificationSettings: () => void;
  toggleSidebar: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSearch,
  onOpenSqlModal,
  onOpenNotificationSettings,
  toggleSidebar,
  onNavigate,
  activeView
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Tratamentos seguros para exibição de dados com fallbacks amigáveis
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Usuário';
  const userRole = currentUser?.role || 'COLABORADOR';
  const userDepartment = currentUser?.department || 'Geral';
  const userRamal = currentUser?.ramal ? `Ramal: ${currentUser.ramal}` : '';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-40 transition-colors">
      
      {/* Esquerda: Logo e Controle da Barra Lateral */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            U
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
            UNICCAT INTRANET
          </span>
        </div>
      </div>

      {/* Centro: Barra de Busca Global */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-left text-xs text-slate-400 dark:text-slate-500 transition"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Buscar ramais, documentos, notícias...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-950 shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Direita: Ações Globais e Perfil de Usuário */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSearch}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition md:hidden"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition"
          title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onOpenSqlModal}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition"
          title="Ver Estrutura SQL do Banco"
        >
          <Database className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenNotificationSettings}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition relative"
          title="Notificações e Alertas"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Menu Suspenso do Usuário */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {currentUser?.photoUrl ? (
              <img 
                src={currentUser.photoUrl} 
                alt={userName} 
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-900/50">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block max-w-[120px]">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">{userDepartment}</p>
            </div>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{userRole} • {userDepartment}</p>
                  {userRamal && <p className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{userRamal}</p>}
                </div>

                <button
                  onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition ${activeView === 'profile' ? 'text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'}`}
                >
                  <User className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Meu Perfil</span>
                </button>

                <button
                  onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition ${activeView === 'admin' ? 'text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'}`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Painel Administrativo</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />

                <button
                  onClick={() => { onLogout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </header>
  );
};
