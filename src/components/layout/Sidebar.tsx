import React from 'react';
import { 
  Home, 
  Megaphone, 
  Link2, 
  FolderKanban, 
  Calendar, 
  Phone, 
  Network, 
  LifeBuoy, 
  CalendarCheck, 
  UserCheck, 
  HelpCircle, 
  ShieldCheck,
  Vote,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentUser: any; // Alterado para aceitar qualquer estrutura dinâmica do Supabase
  isOpen: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  isOpen
}) => {
  const sections: NavSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Início / Dashboard', icon: Home },
        { id: 'announcements', label: 'Comunicados RH', icon: Megaphone, badge: 'Destaque' },
        { id: 'quicklinks', label: 'Links Rápidos', icon: Link2 }
      ]
    },
    {
      title: 'DOCUMENTAÇÃO',
      items: [
        { id: 'documents', label: 'Central de Documentos', icon: FolderKanban },
        { id: 'wiki', label: 'Base de Conhecimento & POP', icon: HelpCircle }
      ]
    },
    {
      title: 'COMUNICAÇÃO & PESSOAS',
      items: [
        { id: 'chat', label: 'Chat & Bate-Papo Realtime', icon: MessageSquare, badge: 'Supabase' },
        { id: 'calendar', label: 'Calendário Corporativo', icon: Calendar },
        { id: 'phonebook', label: 'Lista de Ramais & Telefones', icon: Phone },
        { id: 'orgchart', label: 'Organograma UNICCAT', icon: Network }
      ]
    },
    {
      title: 'SERVIÇOS INTERNOS',
      items: [
        { id: 'tickets', label: 'Chamados de Suporte T.I.', icon: LifeBuoy },
        { id: 'bookings', label: 'Reservas (Salas / Veículos)', icon: CalendarCheck },
        { id: 'hrportal', label: 'Portal do RH & Férias', icon: UserCheck },
        { id: 'polls', label: 'Enquetes & Pesquisas', icon: Vote }
      ]
    },
    {
      title: 'GESTÃO & SEGURANÇA',
      items: [
        { 
          id: 'admin', 
          label: 'Painel Admin & Auditoria', 
          icon: ShieldCheck, 
          adminOnly: true,
          badge: 'Admin'
        }
      ]
    }
  ];

  if (!isOpen) return null;

  // Tratamento de variáveis com fallbacks seguros para evitar quebras de runtime
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Usuário';
  const userDepartment = currentUser?.department || 'Geral';
  const userRamal = currentUser?.ramal || currentUser?.extension || '---';
  const userRole = currentUser?.role || 'USER';

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-all shadow-sm">
      
      {/* User Welcome Mini Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="relative">
          <img
            src={currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/80"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">{userDepartment}</p>
          <span className="inline-block text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Ramal: {userRamal}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {sections.map((section, idx) => {
          // Filtra itens administrativos com base no cargo vindo do banco
          const visibleItems = section.items.filter(item => {
            if (item.adminOnly) {
              return userRole === 'ADMIN' || userRole === 'Administrador' || userRole === 'RH';
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                {section.title}
              </span>

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    id={`nav-item-${item.id}`}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/80 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : item.badge === 'Admin'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80 text-blue-700 dark:text-blue-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center">
        <p className="font-bold text-slate-700 dark:text-slate-300">UNICCAT Intranet v2.6</p>
        <p>Saúde Ocupacional e Segurança</p>
      </div>
    </aside>
  );
};
