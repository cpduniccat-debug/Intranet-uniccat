import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Building, 
  Phone, 
  ShieldCheck, 
  Send, 
  X, 
  Check, 
  Edit3, 
  Layers, 
  Database,
  Tag,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Monitor,
  HardDrive,
  Wifi,
  Printer,
  FileCode2,
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';
import { HelpdeskTicket, UserProfile, Department } from '../../types';
import { 
  getTickets, 
  saveTicket, 
  addTicketComment, 
  classifyTicket, 
  resolveTicket,
  getUsers 
} from '../../lib/storage';
import { TicketSlaReport } from './TicketSlaReport';

interface TicketsViewProps {
  currentUser: UserProfile;
}

const DEPARTMENTS: Department[] = [
  'Diretoria',
  'Medicina Ocupacional',
  'Segurança do Trabalho',
  'Recursos Humanos',
  'Financeiro & Administrativo',
  'Comercial',
  'Recepção & Atendimento',
  'Tecnologia da Informação',
  'Qualidade & Processos'
];

const TI_CATEGORIES = [
  { id: 'Infomed & MedClinic', label: 'Infomed & MedClinic (Sistemas Médicos)', icon: FileCode2 },
  { id: 'Hardware & Computadores', label: 'Hardware, Monitores & Computadores', icon: Monitor },
  { id: 'Sistemas & Acessos', label: 'Sistemas, E-mail & Senhas', icon: ShieldCheck },
  { id: 'Redes & Internet', label: 'Redes, Wi-Fi & Internet', icon: Wifi },
  { id: 'Impressoras & Periféricos', label: 'Impressoras, Leitores & Crachás', icon: Printer },
  { id: 'Outros TI', label: 'Outro Problema de Tecnologia', icon: HelpCircle }
];

export const TicketsView: React.FC<TicketsViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'Administrador' || currentUser.department === 'Tecnologia da Informação';
  
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => getTickets());
  const [techUsers] = useState<UserProfile[]>(() => getUsers());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'all' | 'my' | 'glpi' | 'sla_report'>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [classifyModalOpen, setClassifyModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  // New Ticket Form
  const [newTicketData, setNewTicketData] = useState({
    title: '',
    description: '',
    department: currentUser.department as Department,
    category: 'Infomed & MedClinic',
    subCategory: 'Erro no Sistema',
    priority: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
    extension: currentUser.extension || '100'
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Classification Form
  const [classifyData, setClassifyData] = useState({
    category: 'Infomed & MedClinic',
    subCategory: 'Problema de Acesso / Banco de Dados',
    priority: 'Alta' as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
    assignedToId: currentUser.id,
    assignedToName: currentUser.name
  });

  // Resolution Form
  const [resolveData, setResolveData] = useState({
    solution: '',
    status: 'Resolvido' as 'Resolvido' | 'Em Andamento' | 'Pendente' | 'Cancelado'
  });

  // Comment input
  const [commentText, setCommentText] = useState('');

  const reloadTickets = () => {
    setTickets(getTickets());
  };

  useEffect(() => {
    reloadTickets();
    const handleUpdate = () => reloadTickets();
    window.addEventListener('uniccat_storage_update', handleUpdate);
    return () => window.removeEventListener('uniccat_storage_update', handleUpdate);
  }, []);

  const handleOpenCreateModal = () => {
    setNewTicketData({
      title: '',
      description: '',
      department: currentUser.department,
      category: 'Infomed & MedClinic',
      subCategory: 'Instabilidade / Dúvida',
      priority: 'Média',
      extension: currentUser.extension || '100'
    });
    setFormError('');
    setFormSuccess('');
    setCreateModalOpen(true);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newTicketData.title.trim()) {
      setFormError('Por favor descreva sucintamente o problema no título.');
      return;
    }

    if (!newTicketData.description.trim()) {
      setFormError('Por favor informe os detalhes do problema para a equipe de TI.');
      return;
    }

    const nextCodeNumber = 1026 + tickets.length;
    const newTicket: HelpdeskTicket = {
      id: 'tkt-' + Date.now(),
      code: `UNIC-${nextCodeNumber}`,
      title: newTicketData.title.trim(),
      description: newTicketData.description.trim(),
      category: newTicketData.category,
      subCategory: newTicketData.subCategory,
      priority: newTicketData.priority,
      status: 'Aberto',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDepartment: newTicketData.department,
      requesterExtension: newTicketData.extension,
      assignedTo: 'usr-1',
      assignedToName: 'Carlos Mendonça (Suporte TI)',
      comments: [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    saveTicket(newTicket);
    setFormSuccess('Chamado de Suporte T.I. aberto com sucesso! A equipe técnica foi notificada.');

    setTimeout(() => {
      setCreateModalOpen(false);
      reloadTickets();
    }, 1200);
  };

  const handleOpenClassify = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket);
    setClassifyData({
      category: ticket.category || 'Infomed & MedClinic',
      subCategory: ticket.subCategory || 'Instabilidade / Dúvida',
      priority: ticket.priority,
      assignedToId: ticket.assignedTo || currentUser.id,
      assignedToName: ticket.assignedToName || currentUser.name
    });
    setClassifyModalOpen(true);
  };

  const handleSaveClassification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    classifyTicket(
      selectedTicket.id,
      classifyData.category,
      classifyData.subCategory,
      classifyData.priority,
      classifyData.assignedToId,
      classifyData.assignedToName
    );

    setClassifyModalOpen(false);
    reloadTickets();
  };

  const handleOpenResolve = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket);
    setResolveData({
      solution: ticket.solution || '',
      status: ticket.status === 'Aberto' ? 'Resolvido' : (ticket.status as any)
    });
    setResolveModalOpen(true);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!resolveData.solution.trim()) {
      alert('Por favor descreva a solução técnica aplicada ao chamado.');
      return;
    }

    resolveTicket(
      selectedTicket.id,
      resolveData.solution.trim(),
      resolveData.status,
      currentUser
    );

    setResolveModalOpen(false);
    reloadTickets();
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    addTicketComment(selectedTicket.id, commentText.trim(), currentUser);
    setCommentText('');
    reloadTickets();
    
    // Update local selected ticket reference
    const updated = getTickets().find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    if (viewTab === 'my' && t.requesterId !== currentUser.id) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedDepartment !== 'all' && t.requesterDepartment !== selectedDepartment) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.requesterDepartment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metrics
  const totalCount = tickets.length;
  const abertosCount = tickets.filter(t => t.status === 'Aberto').length;
  const emAndamentoCount = tickets.filter(t => t.status === 'Em Andamento' || t.status === 'Pendente').length;
  const resolvidosCount = tickets.filter(t => t.status === 'Resolvido').length;

  const handleExportTicketsListCSV = () => {
    const headers = [
      'Código', 'Código GLPI', 'Título / Problema', 'Solicitante', 'Departamento',
      'Categoria TI', 'Prioridade', 'Status', 'Técnico TI', 'Data Abertura', 'Ramal'
    ];

    const rows = filteredTickets.map(t => [
      t.id,
      t.glpiTicketId || 'N/A',
      t.title,
      t.requesterName,
      t.requesterDepartment,
      t.category,
      t.priority,
      t.status,
      t.assignedToName || 'Não Atribuído',
      t.createdAt,
      t.requesterExtension || ''
    ]);

    exportToCSV('chamados_suporte_uniccat', headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central de Suporte T.I. & Helpdesk GLPI</h1>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] rounded-full uppercase">
                Rede UNICCAT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Abra chamados para suporte a computadores, Infomed, rede, impressoras e sistemas de tecnologia.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportTicketsListCSV}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
            title="Exportar lista de chamados em planilha Excel (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Chamados (CSV)</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Abrir Chamado T.I.</span>
          </button>
        </div>
      </div>

      {/* GLPI / Helpdesk Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total de Chamados TI</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Abertos / Fila de Espera</p>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{abertosCount}</p>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Em Atendimento / Análise</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{emAndamentoCount}</p>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Atendimentos Solucionados</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{resolvidosCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewTab === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4" /> Todos os Chamados de TI
            </button>

            <button
              onClick={() => setViewTab('my')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewTab === 'my'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" /> Meus Chamados Solicitados
            </button>

            {isAdmin && (
              <button
                onClick={() => setViewTab('glpi')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  viewTab === 'glpi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Painel GLPI do Administrador / Técnico
              </button>
            )}

            <button
              onClick={() => setViewTab('sla_report')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewTab === 'sla_report'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
                  : 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Relatórios & Eficiência SLA
            </button>
          </div>

          <button
            onClick={reloadTickets}
            className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Content Based on Selected Tab */}
        {viewTab === 'sla_report' ? (
          <div className="p-6">
            <TicketSlaReport tickets={tickets} onRefresh={reloadTickets} />
          </div>
        ) : (
          <>
            {/* Filter Toolbar */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, título, solicitante..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {/* Department */}
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">Setor Solicitante: Todos</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">Categoria TI: Todas</option>
            {TI_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">Status: Todos</option>
            <option value="Aberto">Aberto</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Pendente">Pendente</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {/* Tickets Table / GLPI View */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Assunto / Problema T.I.</th>
                <th className="p-3">Setor Solicitante</th>
                <th className="p-3">Categoria TI</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Status</th>
                <th className="p-3">Técnico TI</th>
                <th className="p-3 text-right">Ações GLPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Nenhum chamado de suporte T.I. encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {/* Code */}
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {ticket.code}
                    </td>

                    {/* Title & Requester */}
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ticket.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</p>
                    </td>

                    {/* Sector */}
                    <td className="p-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.requesterDepartment}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{ticket.requesterName} (Ramal: {ticket.requesterExtension || 'N/I'})</p>
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded text-[10px]">
                        {ticket.category || 'T.I. Geral'}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        ticket.priority === 'Crítica' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        ticket.priority === 'Alta' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        ticket.priority === 'Média' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                        ticket.status === 'Aberto' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse' :
                        ticket.status === 'Em Andamento' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        ticket.status === 'Resolvido' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {ticket.status === 'Aberto' && <AlertTriangle className="w-3 h-3" />}
                        {ticket.status === 'Em Andamento' && <Clock className="w-3 h-3" />}
                        {ticket.status === 'Resolvido' && <CheckCircle2 className="w-3 h-3" />}
                        <span>{ticket.status}</span>
                      </span>
                    </td>

                    {/* Technician */}
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {ticket.assignedToName || 'Não Atribuído'}
                    </td>

                    {/* GLPI Action Buttons */}
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Classify / Assign */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenClassify(ticket)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            title="Classificar Categoria, Prioridade e Técnico GLPI"
                          >
                            <Tag className="w-3.5 h-3.5" /> Classificar
                          </button>
                        )}

                        {/* Resolve / Close */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenResolve(ticket)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            title="Dar Resolução Técnica e Fechar Chamado"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dar Resolução
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold transition"
                        >
                          Ver
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </>
        )}

      </div>

      {/* MODAL 1: CREATE T.I. TICKET */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4 my-8">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 rounded-xl">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Abrir Novo Chamado de Suporte T.I.</h3>
                  <p className="text-xs text-slate-500">Informe o setor e descreva o problema de tecnologia</p>
                </div>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sector / Department */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Setor Solicitante *</label>
                  <select
                    required
                    value={newTicketData.department}
                    onChange={e => setNewTicketData({ ...newTicketData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Extension */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ramal para Contato</label>
                  <input
                    type="text"
                    value={newTicketData.extension}
                    onChange={e => setNewTicketData({ ...newTicketData, extension: e.target.value })}
                    placeholder="Ex: 104"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* T.I. Category */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria do Problema de T.I. *</label>
                <select
                  value={newTicketData.category}
                  onChange={e => setNewTicketData({ ...newTicketData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                >
                  {TI_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prioridade Sugerida</label>
                <select
                  value={newTicketData.priority}
                  onChange={e => setNewTicketData({ ...newTicketData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                >
                  <option value="Baixa">Baixa (Dúvida / Consulta)</option>
                  <option value="Média">Média (Aparelho Lento / Falha Pontual)</option>
                  <option value="Alta">Alta (Sistema Indisponível / Certificado Expirado)</option>
                  <option value="Crítica">Crítica (Setor Totalmente Parado)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título do Problema *</label>
                <input
                  type="text"
                  required
                  value={newTicketData.title}
                  onChange={e => setNewTicketData({ ...newTicketData, title: e.target.value })}
                  placeholder="Ex: Erro ao assinar laudo audiométrico no Infomed"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Breve Descrição do Problema *</label>
                <textarea
                  required
                  rows={4}
                  value={newTicketData.description}
                  onChange={e => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  placeholder="Descreva o que aconteceu, mensagem de erro exibida ou equipamento afetado..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Enviar Chamado T.I.
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: GLPI CLASSIFY TICKET (ADMIN / TECH) */}
      {classifyModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Classificação do Chamado GLPI ({selectedTicket.code})</h3>
                  <p className="text-xs text-slate-500">Defina a categoria, prioridade e técnico responsável</p>
                </div>
              </div>
              <button onClick={() => setClassifyModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassification} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria Técnica TI</label>
                <select
                  value={classifyData.category}
                  onChange={e => setClassifyData({ ...classifyData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  {TI_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prioridade SLA GLPI</label>
                <select
                  value={classifyData.priority}
                  onChange={e => setClassifyData({ ...classifyData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  <option value="Baixa">Baixa (SLA: 24 Horas)</option>
                  <option value="Média">Média (SLA: 8 Horas)</option>
                  <option value="Alta">Alta (SLA: 4 Horas)</option>
                  <option value="Crítica">Crítica / Urgente (SLA: 1 Hora)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Atribuir Técnico de TI</label>
                <select
                  value={classifyData.assignedToId}
                  onChange={e => {
                    const tech = techUsers.find(u => u.id === e.target.value);
                    setClassifyData({
                      ...classifyData,
                      assignedToId: e.target.value,
                      assignedToName: tech ? tech.name : 'Suporte TI'
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  {techUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role} - {u.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setClassifyModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Classificação GLPI
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: RESOLVE TICKET (ADMIN / TECH) */}
      {resolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Dar Resolução Técnica ({selectedTicket.code})</h3>
                  <p className="text-xs text-slate-500">Descreva o parecer técnico e solução aplicada ao chamado</p>
                </div>
              </div>
              <button onClick={() => setResolveModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Final / Atual</label>
                <select
                  value={resolveData.status}
                  onChange={e => setResolveData({ ...resolveData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  <option value="Resolvido">Resolvido (Atendimento Concluído)</option>
                  <option value="Em Andamento">Em Andamento (Aguardando Peça / Teste)</option>
                  <option value="Pendente">Pendente (Aguardando Usuário)</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição da Solução Aplicada *</label>
                <textarea
                  required
                  rows={4}
                  value={resolveData.solution}
                  onChange={e => setResolveData({ ...resolveData, solution: e.target.value })}
                  placeholder="Ex: Realizada reconfiguração do driver da impressora e atualizado o certificado digital no Infomed."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Registrar Solução e Concluir
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: TICKET DETAILS & COMMENTS */}
      {selectedTicket && !classifyModalOpen && !resolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-5 my-8">
            
            <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 text-sm">{selectedTicket.code}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedTicket.status === 'Resolvido' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Solicitante:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.requesterName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Setor:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.requesterDepartment}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Ramal:</span>
                <span className="font-bold text-emerald-600">{selectedTicket.requesterExtension || 'N/I'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Categoria TI:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Prioridade:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Técnico TI:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.assignedToName || 'Suporte TI'}</span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Descrição do Problema:</h4>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Solution Display if exists */}
            {selectedTicket.solution && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parecer Técnico / Solução GLPI Registrada ({selectedTicket.solutionDate})</span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  {selectedTicket.solution}
                </p>
              </div>
            )}

            {/* Follow-up Comments */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Histórico de Atendimento & Apontamentos GLPI</span>
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedTicket.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum comentário registrado ainda.</p>
                ) : (
                  selectedTicket.comments.map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.userName}</span>
                        <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escrever apontamento de atendimento..."
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Responder
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
