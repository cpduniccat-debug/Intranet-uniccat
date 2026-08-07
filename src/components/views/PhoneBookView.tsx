import React, { useState } from 'react';
import { Phone, Search, Mail, Smartphone, Building2, MapPin, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types';
import { getUsers } from '../../lib/storage';

export const PhoneBookView: React.FC = () => {
  const [users] = useState<UserProfile[]>(getUsers());
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('Todos');

  const departments = [
    'Todos',
    'Medicina Ocupacional',
    'Segurança do Trabalho',
    'Recursos Humanos',
    'Financeiro & Administrativo',
    'Comercial',
    'Recepção & Atendimento',
    'Tecnologia da Informação'
  ];

  const filtered = users.filter(u => {
    const matchesDept = selectedDept === 'Todos' || u.department === selectedDept;
    const q = search.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(q) ||
      u.extension.includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-3">
        <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Lista de Ramais e Telefones Internos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Diretório completo de colaboradores, consultórios e setores da UNICCAT.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, ramal, setor ou e-mail..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                selectedDept === d
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(user => (
          <div
            key={user.id}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-lg transition duration-200 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <img
                src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 shrink-0"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-300 truncate">
                    {user.name}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-emerald-400">{user.role}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{user.department}</span>
                </p>
              </div>
            </div>

            {/* Extension Badge */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Ramal Direto</span>
                <span className="font-black text-xl text-emerald-400 leading-none">
                  #{user.extension}
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Unidade</span>
                <span className="text-xs font-semibold text-slate-300">
                  {user.location || 'Matriz'}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-400">
              <a
                href={`tel:${user.phone}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Fixo: {user.phone}</span>
              </a>

              <a
                href={`tel:${user.mobile}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Celular: {user.mobile}</span>
              </a>

              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition truncate"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
