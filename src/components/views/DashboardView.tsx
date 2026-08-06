import React, { useState } from 'react';
import { 
  Megaphone, 
  ExternalLink, 
  Calendar, 
  Cake, 
  FileText, 
  CheckCircle2, 
  Pin, 
  AlertTriangle, 
  ArrowRight,
  Globe,
  Activity,
  Stethoscope,
  Mail,
  FileCheck,
  Clock,
  Star,
  Vote,
  LifeBuoy,
  Plus
} from 'lucide-react';
import { Announcement, QuickLink, UserProfile, Birthday, Poll } from '../../types';
import { 
  getAnnouncements, 
  getQuickLinks, 
  getUsers, 
  getCalendarEvents, 
  getPolls,
  getUserFavorites,
  toggleUserFavorite,
  confirmAnnouncementRead,
  votePoll
} from '../../lib/storage';

interface DashboardViewProps {
  currentUser: UserProfile;
  onSelectAnnouncement: (announcement: Announcement) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onSelectAnnouncement,
  onNavigate
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [quickLinks] = useState<QuickLink[]>(getQuickLinks());
  const [users] = useState<UserProfile[]>(getUsers());
  const [events] = useState(getCalendarEvents());
  const [polls, setPolls] = useState<Poll[]>(getPolls());
  const [favorites, setFavorites] = useState<string[]>(getUserFavorites(currentUser.id));
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const handleToggleFavorite = (linkId: string) => {
    toggleUserFavorite(currentUser.id, linkId);
    setFavorites(getUserFavorites(currentUser.id));
  };

  const handleReadConfirm = (e: React.MouseEvent, announcementId: string) => {
    e.stopPropagation();
    confirmAnnouncementRead(announcementId, currentUser.id);
    setAnnouncements(getAnnouncements());
  };

  const handleVote = (pollId: string, optionId: string) => {
    votePoll(pollId, optionId, currentUser.id);
    setPolls(getPolls());
  };

  // Icon mapper helper
  const getIcon = (name: string) => {
    switch (name) {
      case 'Globe': return Globe;
      case 'Activity': return Activity;
      case 'Stethoscope': return Stethoscope;
      case 'Mail': return Mail;
      case 'FileCheck': return FileCheck;
      case 'Clock': return Clock;
      default: return ExternalLink;
    }
  };

  // Current Month Birthdays
  const currentMonthBirthdays: Birthday[] = users.map(u => ({
    id: u.id,
    name: u.name,
    photoUrl: u.photoUrl,
    department: u.department,
    role: u.role,
    birthDate: u.birthDate || '1990-08-15',
    day: u.birthDate ? parseInt(u.birthDate.split('-')[2]) : 15,
    month: u.birthDate ? parseInt(u.birthDate.split('-')[1]) : 8
  })).filter(b => b.month === 8).sort((a, b) => a.day - b.day);

  // Filtered Announcements
  const categories = ['Todos', 'Comunicados', 'Campanhas', 'Eventos', 'Treinamentos', 'Comunicados Urgentes'];
  
  const filteredAnnouncements = announcements.filter(a => {
    if (selectedCategory === 'Todos') return true;
    return a.category === selectedCategory;
  });

  const activePoll = polls.find(p => p.active);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-blue-900 border border-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-700/80 text-blue-200 text-xs font-semibold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bem-vindo à Intranet UNICCAT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Acompanhe os comunicados oficiais do RH, acesse seus sistemas médicos e de gestão, e fique por dentro da programação da semana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('tickets')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Abrir Chamado T.I.</span>
            </button>

            <button
              onClick={() => onNavigate('documents')}
              className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700 font-bold text-xs rounded-lg flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Central de Documentos</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE COMUNICAÇÃO INTERNA (RH) - HIGHLIGHT */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Painel de Comunicação Interna (RH)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avisos oficiais, comunicados urgentes, benefícios e campanhas corporativas
              </p>
            </div>
          </div>

          {/* Category Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.slice(0, 6).map(a => {
            const isRead = a.readBy?.includes(currentUser.id);

            return (
              <div
                key={a.id}
                onClick={() => onSelectAnnouncement(a)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Header if exists */}
                {a.coverImage && (
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={a.coverImage}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    
                    {a.pinned && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Pin className="w-3 h-3" /> Fixado
                      </span>
                    )}

                    {a.priority === 'Urgente' && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-rose-600 text-white font-extrabold text-[10px] rounded uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Urgente
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded uppercase tracking-wide">
                        {a.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{a.publishDate}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                      {a.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {a.summary}
                    </p>
                  </div>

                  {/* Read Status & Read More Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={a.authorPhotoUrl} alt={a.authorName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">
                        {a.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.requiresReadConfirmation && (
                        <button
                          onClick={(e) => handleReadConfirm(e, a.id)}
                          disabled={isRead}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                            isRead
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isRead ? 'Lido' : 'Confirmar'}</span>
                        </button>
                      )}

                      <span className="text-blue-700 dark:text-blue-400 font-bold text-xs group-hover:underline flex items-center gap-0.5">
                        Leia mais <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ÁREA DE LINKS RÁPIDOS */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Área de Links Rápidos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atalhos para os principais sistemas operacionais da UNICCAT
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('quicklinks')}
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Gerenciar Links</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(link => {
            const IconComponent = getIcon(link.iconName);
            const isFav = favorites.includes(link.id);

            return (
              <div
                key={link.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl shadow-sm transition group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-3 bg-blue-50 dark:bg-slate-950 border border-blue-100 dark:border-slate-800 rounded-lg text-blue-700 dark:text-blue-400 shrink-0">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                        {link.title}
                      </span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[9px] font-bold uppercase rounded shrink-0">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">
                      {link.description}
                    </p>
                    <a
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline transition"
                    >
                      <span>Acessar Sistema</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFavorite(link.id)}
                  title={isFav ? "Remover dos Favoritos" : "Favoritar Link"}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* TWO COLUMN GRID: Birthdays/Events & Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        
        {/* Left Column (2 cols): Aniversariantes & Calendário */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Aniversariantes do Mês */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Cake className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Aniversariantes do Mês de Agosto 🎂
                </h3>
              </div>
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
                {currentMonthBirthdays.length} colaboradores
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentMonthBirthdays.map(b => (
                <div 
                  key={b.id} 
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-amber-400 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={b.photoUrl} alt={b.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{b.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{b.department}</p>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                        Dia {b.day} de Agosto
                      </span>
                    </div>
                  </div>

                  <a
                    href={`mailto:${b.id}@uniccat.com.br?subject=Parabéns%20pelo%20seu%20aniversário!`}
                    className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-bold transition shrink-0"
                  >
                    Parabéns 🎉
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Agenda Corporativa & Treinamentos
                </h3>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
              >
                Ver Agenda Completa
              </button>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 3).map(evt => (
                <div
                  key={evt.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-center shrink-0">
                      <span className="block text-[10px] uppercase text-blue-700 dark:text-blue-300 font-bold">
                        {evt.startDate.split('-')[1]}
                      </span>
                      <span className="block text-sm font-extrabold text-blue-900 dark:text-white leading-none">
                        {evt.startDate.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{evt.category}</span>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{evt.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{evt.time} • {evt.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Active Poll & Quick HR Tools */}
        <div className="space-y-6">
          
          {/* Active Poll Widget */}
          {activePoll && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Vote className="w-4 h-4" />
                <span>Enquete Corporativa</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {activePoll.question}
              </h3>

              <div className="space-y-2">
                {activePoll.options.map(opt => {
                  const hasVoted = activePoll.votedUserIds.includes(currentUser.id);
                  const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0);
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={opt.id}
                      disabled={hasVoted}
                      onClick={() => handleVote(activePoll.id, opt.id)}
                      className={`w-full p-2.5 rounded-lg text-left border text-xs font-medium transition relative overflow-hidden ${
                        hasVoted
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-default'
                          : 'bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:border-blue-300 text-slate-800 dark:text-white'
                      }`}
                    >
                      {hasVoted && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-blue-100 dark:bg-blue-950/80 border-r border-blue-300 dark:border-blue-800 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between">
                        <span>{opt.text}</span>
                        {hasVoted && <span className="font-bold text-blue-700 dark:text-blue-400 text-[11px]">{percentage}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePoll.votedUserIds.includes(currentUser.id) && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                  ✓ Seu voto foi computado com sucesso!
                </p>
              )}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Solicitações Rápidas
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('hrportal')}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950/80 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg text-left transition flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 group"
              >
                <span>Solicitar Férias ou Licença</span>
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('bookings')}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950/80 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg text-left transition flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 group"
              >
                <span>Reservar Sala de Reunião / Veículo</span>
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('wiki')}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950/80 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg text-left transition flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 group"
              >
                <span>Consultar POPs & Manuais</span>
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
