import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Megaphone, 
  FileText, 
  Link2, 
  User, 
  LifeBuoy, 
  HelpCircle,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  getAnnouncements, 
  getDocuments, 
  getQuickLinks, 
  getUsers, 
  getTickets, 
  getWiki 
} from '../../lib/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'documents' | 'links' | 'users' | 'tickets'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const announcements = getAnnouncements();
  const documents = getDocuments();
  const links = getQuickLinks();
  const users = getUsers();
  const tickets = getTickets();
  const wiki = getWiki();

  const q = query.toLowerCase().trim();

  const filteredAnnouncements = q
    ? announcements.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
    : announcements.slice(0, 3);

  const filteredDocuments = q
    ? documents.filter(d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
    : documents.slice(0, 3);

  const filteredLinks = q
    ? links.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
    : links.slice(0, 4);

  const filteredUsers = q
    ? users.filter(u => u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.extension.includes(q))
    : users.slice(0, 4);

  const filteredTickets = q
    ? tickets.filter(t => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
    : [];

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar por comunicados, documentos, ramais, links, chamados..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg transition"
          >
            ESC
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'announcements', label: 'Comunicados' },
            { id: 'documents', label: 'Documentos' },
            { id: 'links', label: 'Links Rápidos' },
            { id: 'users', label: 'Ramais / Pessoas' },
            { id: 'tickets', label: 'Chamados' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Links Section */}
          {(activeTab === 'all' || activeTab === 'links') && filteredLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Links Rápidos ({filteredLinks.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredLinks.map(l => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg flex items-center justify-between transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">{l.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{l.description}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Announcements Section */}
          {(activeTab === 'all' || activeTab === 'announcements') && filteredAnnouncements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Megaphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Comunicados RH ({filteredAnnouncements.length})</span>
              </div>
              <div className="space-y-2">
                {filteredAnnouncements.map(a => (
                  <div
                    key={a.id}
                    onClick={() => handleSelect('announcements')}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">{a.category}</span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{a.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{a.summary}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {(activeTab === 'all' || activeTab === 'documents') && filteredDocuments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Documentos & POPs ({filteredDocuments.length})</span>
              </div>
              <div className="space-y-2">
                {filteredDocuments.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleSelect('documents')}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">{d.category} • {d.department}</span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{d.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{d.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users / Phone Directory Section */}
          {(activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ramais & Colaboradores ({filteredUsers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleSelect('phonebook')}
                    className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg cursor-pointer transition flex items-center gap-3 group"
                  >
                    <img src={u.photoUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.department}</p>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Ramal: {u.extension}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Section */}
          {(activeTab === 'all' || activeTab === 'tickets') && filteredTickets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <LifeBuoy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Chamados ({filteredTickets.length})</span>
              </div>
              <div className="space-y-2">
                {filteredTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect('tickets')}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">{t.code} • {t.status}</span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{t.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {q && filteredAnnouncements.length === 0 && filteredDocuments.length === 0 && filteredLinks.length === 0 && filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhum resultado encontrado para "<span className="text-slate-900 dark:text-white font-semibold">{query}</span>".
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
