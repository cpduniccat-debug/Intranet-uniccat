import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { CalendarEvent, UserProfile } from '../../types';
import { getCalendarEvents, saveCalendarEvent, deleteCalendarEvent } from '../../lib/storage';

interface CalendarViewProps {
  currentUser: UserProfile;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Event Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Feriado' | 'Treinamento' | 'Evento' | 'Reunião' | 'Campanha' | 'Aniversário'>('Evento');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('Auditório UNICCAT');

  const canManage = currentUser.role === 'Administrador' || currentUser.role === 'RH';

  const categories = ['Todos', 'Feriado', 'Treinamento', 'Evento', 'Reunião', 'Campanha', 'Aniversário'];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) return;

    const newEvt: CalendarEvent = {
      id: 'evt-' + Date.now(),
      title,
      description,
      category,
      startDate,
      time,
      location,
      organizer: currentUser.name,
      isAllDay: false
    };

    saveCalendarEvent(newEvt);
    setEvents(getCalendarEvents());
    setAddModalOpen(false);

    setTitle('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este evento do calendário?')) {
      deleteCalendarEvent(id);
      setEvents(getCalendarEvents());
    }
  };

  const filtered = events.filter(e => {
    if (selectedCategory === 'Todos') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-2xl text-cyan-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Calendário Corporativo & Eventos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Agenda oficial de reuniões gerais, treinamentos de segurança, campanhas e feriados da UNICCAT.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setAddModalOpen(true)}
            id="btn-add-event"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento / Treinamento</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(evt => (
          <div
            key={evt.id}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg transition duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-[10px] uppercase rounded">
                  {evt.category}
                </span>

                {canManage && (
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-start gap-3">
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center shrink-0">
                  <span className="block text-[10px] font-bold text-cyan-400 uppercase">
                    Agosto
                  </span>
                  <span className="block text-lg font-black text-white leading-none mt-0.5">
                    {evt.startDate.split('-')[2]}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">{evt.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{evt.description}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Horário: <strong className="text-slate-200">{evt.time || 'Dia inteiro'}</strong></span>
              </div>

              {evt.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Local: <strong className="text-slate-200">{evt.location}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Organização: <strong className="text-slate-300">{evt.organizer}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Agendar Evento Corporativo</span>
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Treinamento NR-35 e Segurança do Trabalho"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="09:00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Local / Sala</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Auditório UNICCAT"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes e público-alvo..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
