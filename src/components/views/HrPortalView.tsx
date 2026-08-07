import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Printer, 
  Phone, 
  Building2, 
  Sparkles, 
  X, 
  User, 
  Sun, 
  Briefcase,
  FileText,
  ExternalLink,
  Users,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { exportToCSV, printFormattedReport } from '../../lib/exportUtils';
import { UserProfile, VacationNotice, VacationStatus, Department } from '../../types';
import { 
  getVacationNotices, 
  saveVacationNotice, 
  deleteVacationNotice, 
  getUsers, 
  addAuditLog 
} from '../../lib/storage';

interface HrPortalViewProps {
  currentUser: UserProfile;
}

export const HrPortalView: React.FC<HrPortalViewProps> = ({ currentUser }) => {
  const [vacations, setVacations] = useState<VacationNotice[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<VacationNotice | null>(null);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeePhotoUrl: '',
    department: 'Medicina Ocupacional' as Department,
    role: 'Funcionário',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
    daysCount: 15,
    status: 'Programada' as VacationStatus,
    substituteName: '',
    substitutePhone: '',
    notes: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Delete Confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManage = currentUser.role === 'Administrador' || currentUser.role === 'RH' || currentUser.role === 'Coordenador' || currentUser.role === 'Gestor';

  useEffect(() => {
    loadData();

    const handleStorageUpdate = (e: any) => {
      if (!e.detail || e.detail.key === 'uniccat_intranet_vacations_v1') {
        loadData();
      }
    };

    window.addEventListener('uniccat_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('uniccat_storage_update', handleStorageUpdate);
  }, []);

  const loadData = () => {
    setVacations(getVacationNotices());
    setUsers(getUsers());
  };

  // Calculate days difference between dates
  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleStartDateChange = (val: string) => {
    const days = calculateDays(val, formData.endDate);
    setFormData(prev => ({
      ...prev,
      startDate: val,
      daysCount: days > 0 ? days : 1
    }));
  };

  const handleEndDateChange = (val: string) => {
    const days = calculateDays(formData.startDate, val);
    setFormData(prev => ({
      ...prev,
      endDate: val,
      daysCount: days > 0 ? days : 1
    }));
  };

  const handleSelectEmployee = (usrId: string) => {
    if (!usrId) return;
    const usr = users.find(u => u.id === usrId);
    if (usr) {
      setFormData(prev => ({
        ...prev,
        employeeId: usr.id,
        employeeName: usr.name,
        employeePhotoUrl: usr.photoUrl,
        department: usr.department,
        role: usr.role
      }));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingVacation(null);
    const defaultUser = users[0];
    setFormData({
      employeeId: defaultUser?.id || '',
      employeeName: defaultUser?.name || '',
      employeePhotoUrl: defaultUser?.photoUrl || '',
      department: defaultUser?.department || 'Medicina Ocupacional',
      role: defaultUser?.role || 'Funcionário',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
      daysCount: 16,
      status: 'Programada',
      substituteName: '',
      substitutePhone: '',
      notes: ''
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: VacationNotice) => {
    setEditingVacation(item);
    setFormData({
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      employeePhotoUrl: item.employeePhotoUrl || '',
      department: item.department,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      daysCount: item.daysCount,
      status: item.status,
      substituteName: item.substituteName || '',
      substitutePhone: item.substitutePhone || '',
      notes: item.notes || ''
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.employeeName.trim()) {
      setFormError('Por favor informe o nome do colaborador.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError('Por favor preencha as datas de início e término das férias.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('A data de término não pode ser anterior à data de início.');
      return;
    }

    const calculatedDays = calculateDays(formData.startDate, formData.endDate);

    const notice: VacationNotice = {
      id: editingVacation ? editingVacation.id : 'vac-' + Date.now(),
      employeeId: formData.employeeId || 'usr-guest',
      employeeName: formData.employeeName.trim(),
      employeePhotoUrl: formData.employeePhotoUrl || undefined,
      department: formData.department,
      role: formData.role,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysCount: calculatedDays,
      status: formData.status,
      substituteName: formData.substituteName.trim() || undefined,
      substitutePhone: formData.substitutePhone.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdBy: `${currentUser.name} (${currentUser.role})`,
      createdAt: editingVacation ? editingVacation.createdAt : new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    saveVacationNotice(notice);
    
    addAuditLog(
      currentUser,
      editingVacation ? 'EDITAR_PERMISSAO' : 'CRIAR_COMUNICADO',
      `Aviso de Férias para "${notice.employeeName}" (${notice.startDate} a ${notice.endDate}) ${editingVacation ? 'atualizado' : 'registrado'} por ${currentUser.name}.`
    );

    setFormSuccess(editingVacation ? 'Aviso de férias atualizado com sucesso!' : 'Aviso de férias cadastrado no mural com sucesso!');

    setTimeout(() => {
      setIsModalOpen(false);
      loadData();
    }, 1000);
  };

  const handleDelete = (id: string) => {
    const target = vacations.find(v => v.id === id);
    deleteVacationNotice(id);
    if (target) {
      addAuditLog(currentUser, 'EXCLUIR_REGISTRO', `Aviso de férias de "${target.employeeName}" removido do mural.`);
    }
    setDeletingId(null);
    loadData();
  };

  // Filtered List
  const filteredVacations = vacations.filter(item => {
    const matchesSearch = 
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.substituteName && item.substituteName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'Todos' || item.department === selectedDept;
    const matchesStatus = selectedStatus === 'Todos' || item.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Today Date String
  const todayStr = new Date().toISOString().substring(0, 10);

  // Active vacations today
  const currentlyOnVacation = vacations.filter(v => {
    return v.startDate <= todayStr && v.endDate >= todayStr && v.status !== 'Cancelada';
  });

  // Upcoming scheduled vacations
  const upcomingVacations = vacations.filter(v => {
    return v.startDate > todayStr && v.status === 'Programada';
  });

  const getStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case 'Em Andamento':
        return (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Em Andamento
          </span>
        );
      case 'Programada':
        return (
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Programada
          </span>
        );
      case 'Concluída':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Concluída
          </span>
        );
      case 'Cancelada':
        return (
          <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <X className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Cancelada
          </span>
        );
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleExportVacationsCSV = () => {
    const headers = [
      'Colaborador', 'Setor / Departamento', 'Cargo', 'Data Início', 'Data Término',
      'Total Dias', 'Status Férias', 'Substituto de Cobertura', 'Contato Substituto', 'Observações'
    ];

    const rows = filteredVacations.map(v => [
      v.employeeName,
      v.department,
      v.role,
      formatDateString(v.startDate),
      formatDateString(v.endDate),
      v.daysCount,
      v.status,
      v.substituteName || 'Nenhum',
      v.substitutePhone || 'N/A',
      v.notes || ''
    ]);

    exportToCSV('escala_ferias_uniccat', headers, rows);
  };

  const handlePrintVacationsReport = () => {
    const headers = ['Colaborador', 'Departamento', 'Cargo', 'Período', 'Dias', 'Status', 'Substituto'];
    const rows = filteredVacations.map(v => [
      v.employeeName,
      v.department,
      v.role,
      `${formatDateString(v.startDate)} a ${formatDateString(v.endDate)}`,
      v.daysCount,
      v.status,
      v.substituteName || 'Nenhum'
    ]);

    printFormattedReport(
      'Relatório Corporativo de Escala de Férias & Ausências RH',
      `Filtro Setor: ${selectedDept} | Status: ${selectedStatus}`,
      headers,
      rows
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <Sun className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-700/50 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-200">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal do Colaborador & Gestão de Pessoas UNICCAT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Mural de Avisos & Escala de Férias
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Consulte a programação corporativa de férias dos colaboradores, identifique os substitutos de cobertura por setor e mantenha o acompanhamento transparente das ausências planejadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportVacationsCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 text-xs"
              title="Exportar planilha Excel de escala de férias"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrintVacationsReport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition flex items-center gap-2 text-xs shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            {canManage && (
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-xs uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Novo Aviso de Férias</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Em Férias Hoje</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentlyOnVacation.length} <span className="text-xs font-normal text-slate-500">colaborador(es)</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Férias Programadas</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {upcomingVacations.length} <span className="text-xs font-normal text-slate-500">agendadas</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Avisos</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {vacations.length} <span className="text-xs font-normal text-slate-500">registros</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Setores Mapeados</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {new Set(vacations.map(v => v.department)).size} <span className="text-xs font-normal text-slate-500">departamentos</span>
            </h3>
          </div>
        </div>

      </div>

      {/* Currently On Vacation Highlight Banner */}
      {currentlyOnVacation.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600 animate-spin-slow" />
              <span>Colaboradores Atualmente em Período de Férias ({currentlyOnVacation.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
              Status Hoje ({formatDateString(todayStr)})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentlyOnVacation.map(item => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.employeePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={item.employeeName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{item.employeeName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.role} • {item.department}</p>
                    <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                      Retorno previsto: {formatDateString(item.endDate)}
                    </p>
                  </div>
                </div>

                {item.substituteName && (
                  <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-[10px]">
                    <span className="text-slate-400 block font-medium">Substituto(a):</span>
                    <strong className="text-slate-800 dark:text-slate-200 block truncate max-w-[110px]">{item.substituteName}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Board Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por colaborador, substituto ou cargo..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Setores</option>
                <option value="Medicina Ocupacional">Medicina Ocupacional</option>
                <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Financeiro & Administrativo">Financeiro & Admin</option>
                <option value="Comercial">Comercial</option>
                <option value="Recepção & Atendimento">Recepção & Atendimento</option>
                <option value="Tecnologia da Informação">TI & Tecnologia</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Programada">Programada</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  viewMode === 'cards' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Lista
              </button>
            </div>

          </div>

        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          
          {filteredVacations.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Sun className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">Nenhum aviso de férias encontrado</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Não há nenhuma programação cadastrada com os filtros selecionados.
              </p>
              {canManage && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition mt-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Aviso de Férias
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVacations.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.employeePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                          alt={item.employeeName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-600/20 group-hover:ring-blue-600/60 transition shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{item.employeeName}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.role}</p>
                          <span className="inline-block text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1">
                            {item.department}
                          </span>
                        </div>
                      </div>

                      {getStatusBadge(item.status)}
                    </div>

                    {/* Dates Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Período
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.daysCount} dias
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>Início: <span className="text-blue-700 dark:text-blue-400">{formatDateString(item.startDate)}</span></span>
                        <span>Fim: <span className="text-blue-700 dark:text-blue-400">{formatDateString(item.endDate)}</span></span>
                      </div>
                    </div>

                    {/* Substitute / Cover Info */}
                    {item.substituteName && (
                      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl space-y-1">
                        <span className="text-[10px] uppercase font-black text-blue-800 dark:text-blue-300 tracking-wider block">
                          Substituto de Cobertura:
                        </span>
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-slate-900 dark:text-white">{item.substituteName}</strong>
                          {item.substitutePhone && (
                            <a 
                              href={`tel:${item.substitutePhone}`} 
                              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> {item.substitutePhone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer / Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Reg: {item.createdBy || 'RH'}</span>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                          title="Editar Aviso"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                          title="Excluir Aviso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                    <th className="p-3.5">Colaborador</th>
                    <th className="p-3.5">Setor / Cargo</th>
                    <th className="p-3.5">Período de Férias</th>
                    <th className="p-3.5">Dias</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Substituto</th>
                    {canManage && <th className="p-3.5 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
                  {filteredVacations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-bold flex items-center gap-2.5">
                        <img
                          src={item.employeePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={item.employeeName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <span>{item.employeeName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block">{item.department}</span>
                        <span className="text-[11px] text-slate-500">{item.role}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        {formatDateString(item.startDate)} até {formatDateString(item.endDate)}
                      </td>
                      <td className="p-3.5 font-bold text-center">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          {item.daysCount} d
                        </span>
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-3.5">
                        {item.substituteName ? (
                          <div>
                            <span className="font-bold block">{item.substituteName}</span>
                            {item.substitutePhone && <span className="text-[10px] text-slate-500">{item.substitutePhone}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* HR Services Section / Atalhos do Colaborador */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Serviços de RH & Autoatendimento do Colaborador</span>
            </h3>
            <p className="text-xs text-slate-500">Acesse sistemas externos de ponto eletrônico, contracheques e gestão de benefícios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <a
            href="https://autenticador.secullum.com.br/Authorization?client_id=3001&response_type=code&redirect_uri=https%3A%2F%2Fpontoweb.secullum.com.br%2FAuth"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 rounded-xl transition flex items-center gap-3.5 group"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center justify-between">
                <span>Secullum Ponto Web</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Espelho de ponto e justificativas</p>
            </div>
          </a>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Holerites & Rendimentos</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Solicitação via Departamento de RH</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center gap-3.5">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Gestão de Benefícios</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">VT, VR/VA, Plano de Saúde UNICCAT</p>
            </div>
          </div>

        </div>
      </div>

      {/* Modal - Create/Edit Vacation Notice */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {editingVacation ? 'Editar Programação de Férias' : 'Cadastrar Novo Aviso de Férias no Mural'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Colaborador Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selecione o Colaborador Cadastrado *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">-- Selecione na Lista de Colaboradores --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Employee Name / Department override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo do Colaborador *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeName}
                    onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="Nome do colaborador..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento / Setor *
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="Medicina Ocupacional">Medicina Ocupacional</option>
                    <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Financeiro & Administrativo">Financeiro & Admin</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Recepção & Atendimento">Recepção & Atendimento</option>
                    <option value="Tecnologia da Informação">TI & Tecnologia</option>
                    <option value="Qualidade & Processos">Qualidade & Processos</option>
                    <option value="Diretoria">Diretoria</option>
                  </select>
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Início das Férias *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Término das Férias *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={e => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 dark:text-blue-300 pt-1 border-t border-blue-200/60 dark:border-blue-900/40">
                  <span>Duração do Período Calculada:</span>
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-mono">
                    {formData.daysCount} dias corridos
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status da Escala de Férias *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as VacationStatus })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Programada">Programada (Agendada para data futura)</option>
                  <option value="Em Andamento">Em Andamento (Colaborador ausente hoje)</option>
                  <option value="Concluída">Concluída (Retornou às atividades)</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Substitute / Cobertura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Substituto de Cobertura (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.substituteName}
                    onChange={e => setFormData({ ...formData, substituteName: e.target.value })}
                    placeholder="Nome do colega de equipe..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / Ramal do Substituto
                  </label>
                  <input
                    type="text"
                    value={formData.substitutePhone}
                    onChange={e => setFormData({ ...formData, substitutePhone: e.target.value })}
                    placeholder="(11) 3456-7800 ou Ramal 101..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações e Passagem de Bastão
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Orientações de atendimento, remanejamento de laudos ou avisos do RH..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingVacation ? 'Salvar Alterações' : 'Publicar no Mural de Férias'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal - Confirm Delete */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Remover do Mural de Férias?</h3>
            <p className="text-xs text-slate-500">
              Tem certeza que deseja excluir esta programação de férias?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
