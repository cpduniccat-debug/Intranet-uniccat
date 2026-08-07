import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Activity, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Phone, 
  Mail, 
  Calendar, 
  BadgeCheck, 
  Eye, 
  EyeOff,
  Power,
  RefreshCw,
  Sparkles,
  Lock,
  Layers,
  LifeBuoy,
  Camera,
  Upload
} from 'lucide-react';
import { UserProfile, Role, Department, AuditLog } from '../../types';
import { getUsers, saveUser, saveUsersBatch, deleteUser, getAuditLogs, addAuditLog, syncAllLocalDataToSupabase, getLastSupabaseError } from '../../lib/storage';
import { isSupabaseConfigured, testSupabaseConnection, SupabaseTestResult, supabaseUrl, supabaseAnonKey } from '../../lib/supabaseClient';
import { UNICCAT_SUPABASE_UNBLOCK_RLS_SQL } from '../../lib/sqlSchema';
import { TicketsView } from './TicketsView';
import { Copy, Download, CloudUpload, ShieldAlert, FileSpreadsheet, FileUp, FileText } from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';


interface AdminViewProps {
  currentUser: UserProfile;
  onOpenSqlModal: () => void;
}

const ROLES: Role[] = [
  'Administrador',
  'RH',
  'Financeiro',
  'Comercial',
  'Recepção',
  'Médico',
  'Coordenador',
  'Gestor',
  'Funcionário'
];

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

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80'
];

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, onOpenSqlModal }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'supabase' | 'glpi'>('users');
  const [users, setUsers] = useState<UserProfile[]>(() => getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State for Create / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'uni@123',
    role: 'Funcionário' as Role,
    department: 'Medicina Ocupacional' as Department,
    phone: '(11) 3300-1000',
    extension: '100',
    mobile: '(11) 98888-0000',
    photoUrl: PRESET_AVATARS[0],
    location: 'Sede Principal - SP',
    birthDate: '1990-05-15',
    hireDate: new Date().toISOString().split('T')[0],
    bio: '',
    active: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Handle JPEG photo upload for Admin Modal (Max 4MB)
  const handleAdminImageUpload = (file: File) => {
    setFormError('');
    setFormSuccess('');

    const fileName = file.name.toLowerCase();
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

    if (!isJpeg) {
      setFormError('Apenas imagens no formato JPEG (.jpg ou .jpeg) são permitidas.');
      return;
    }

    const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFormError(`A imagem enviada possui ${fileSizeMB} MB. O limite máximo permitido é 4 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        setFormSuccess('Foto JPEG do colaborador carregada com sucesso!');
      }
    };
    reader.onerror = () => {
      setFormError('Erro ao carregar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  // Delete User Confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Supabase Diagnostics & Sync State
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [testingConn, setTestingConn] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [copiedRlsSql, setCopiedRlsSql] = useState(false);

  const handleTestSupabase = async () => {
    setTestingConn(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTestingConn(false);
  };

  const handleSyncAllToSupabase = async () => {
    setSyncingData(true);
    setSyncResult(null);
    const res = await syncAllLocalDataToSupabase();
    setSyncResult(res);
    setSyncingData(false);
  };

  const handleCopyRlsSql = () => {
    navigator.clipboard.writeText(UNICCAT_SUPABASE_UNBLOCK_RLS_SQL);
    setCopiedRlsSql(true);
    setTimeout(() => setCopiedRlsSql(false), 2500);
  };


  const loadData = () => {
    setUsers(getUsers());
    setAuditLogs(getAuditLogs());
  };

  const handleExportUsersCSV = () => {
    const headers = [
      'ID', 'Nome', 'E-mail', 'Cargo', 'Departamento',
      'Ramal', 'Telefone', 'Celular', 'Localização', 'Status Ativo', 'Data Admissão'
    ];

    const rows = filteredUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.department,
      u.extension || '',
      u.phone || '',
      u.mobile || '',
      u.location || '',
      u.active ? 'Ativo' : 'Inativo',
      u.hireDate || ''
    ]);

    exportToCSV('usuarios_colaboradores_uniccat', headers, rows);
  };

  const handleExportAuditLogsCSV = () => {
    const headers = ['ID Registro', 'Data / Hora', 'Usuário', 'Ação / Evento', 'Detalhes da Operação', 'IP Origem'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.userName,
      l.action,
      l.details,
      l.ipAddress || '127.0.0.1'
    ]);

    exportToCSV('logs_auditoria_seguranca_uniccat', headers, rows);
  };

  // Batch User Import Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawText, setBatchRawText] = useState('');
  const [batchError, setBatchError] = useState('');
  const [batchSuccess, setBatchSuccess] = useState('');
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplateCSV = () => {
    const headers = ['Nome', 'Email', 'Cargo', 'Departamento', 'Ramal', 'Telefone', 'Celular', 'Localizacao'];
    const sampleRows = [
      ['Ana Paula Souza', 'ana.souza@uniccat.com.br', 'Funcionário', 'Medicina Ocupacional', '101', '(11) 3300-1001', '(11) 99111-2233', 'Sede Principal - SP'],
      ['Carlos Eduardo Mendes', 'carlos.mendes@uniccat.com.br', 'Gestor', 'TI / Sistemas', '102', '(11) 3300-1002', '(11) 99222-3344', 'Sede Principal - SP'],
      ['Mariana Lima Santos', 'mariana.lima@uniccat.com.br', 'RH', 'Recursos Humanos / DP', '103', '(11) 3300-1003', '(11) 99333-4455', 'Filial Alphaville - SP'],
      ['Roberto Alves Silva', 'roberto.alves@uniccat.com.br', 'Financeiro', 'Financeiro / Contabilidade', '104', '(11) 3300-1004', '(11) 99444-5566', 'Sede Principal - SP']
    ];
    exportToCSV('modelo_importacao_usuarios_uniccat', headers, sampleRows);
  };

  const parseUsersFromInput = (rawText: string): UserProfile[] => {
    const trimmed = rawText.trim();
    if (!trimmed) return [];

    let rawList: any[] = [];

    // JSON format check
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        rawList = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Fallback to CSV
      }
    }

    if (rawList.length === 0) {
      // CSV format (lines separated by comma or semicolon)
      const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) return [];

      const firstLine = lines[0];
      const sep = firstLine.includes(';') ? ';' : ',';

      let startIdx = 0;
      if (firstLine.toLowerCase().includes('nome') || firstLine.toLowerCase().includes('email')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 2) continue;

        const [name, email, role, department, extension, phone, mobile, location] = parts;
        if (!name || !email) continue;

        rawList.push({
          name,
          email,
          role,
          department,
          extension,
          phone,
          mobile,
          location
        });
      }
    }

    // Convert raw parsed objects to valid UserProfile items
    return rawList.map((item, idx) => {
      const name = (item.name || item.Nome || 'Novo Colaborador').trim();
      const email = (item.email || item.Email || item['E-mail'] || `usuario${idx + 1}@uniccat.com.br`).trim();
      const role: Role = ROLES.includes(item.role || item.Cargo) ? (item.role || item.Cargo) : 'Funcionário';
      const department: Department = DEPARTMENTS.includes(item.department || item.Departamento) 
        ? (item.department || item.Departamento) 
        : 'Medicina Ocupacional';

      return {
        id: `u-batch-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        email,
        password: item.password || 'uni@123',
        role,
        department,
        extension: item.extension || item.Ramal || Math.floor(100 + Math.random() * 800).toString(),
        phone: item.phone || item.Telefone || '(11) 3300-1000',
        mobile: item.mobile || item.Celular || '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
        photoUrl: PRESET_AVATARS[idx % PRESET_AVATARS.length],
        location: item.location || item.Localizacao || item.Localização || 'Sede Principal - SP',
        birthDate: '1992-06-15',
        hireDate: new Date().toISOString().split('T')[0],
        bio: 'Colaborador importado automaticamente via lote de cadastro.',
        active: true
      };
    });
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBatchRawText(content);
        setBatchSuccess(`Arquivo "${file.name}" carregado com sucesso!`);
      }
    };
    reader.onerror = () => {
      setBatchError('Erro ao carregar arquivo de texto/CSV.');
    };
    reader.readAsText(file);
  };

  const handleExecuteBatchImport = () => {
    setBatchError('');
    setBatchSuccess('');

    const parsedUsers = parseUsersFromInput(batchRawText);
    if (parsedUsers.length === 0) {
      setBatchError('Nenhum usuário válido encontrado no texto/arquivo. Verifique se o formato possui ao menos "Nome" e "Email".');
      return;
    }

    saveUsersBatch(parsedUsers);
    addAuditLog(currentUser, 'IMPORTACAO_LOTE_USUARIOS', `Importou em lote ${parsedUsers.length} usuários para a Intranet.`);
    loadData();

    setBatchSuccess(`Sucesso! ${parsedUsers.length} colaborador(es) cadastrado(s) e integrados com sucesso na Intranet.`);
    setTimeout(() => {
      setIsBatchModalOpen(false);
      setBatchRawText('');
      setBatchSuccess('');
    }, 2000);
  };

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('uniccat_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('uniccat_storage_update', handleStorageUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: 'uni@123',
      role: 'Funcionário',
      department: 'Medicina Ocupacional',
      phone: '(11) 3300-1000',
      extension: Math.floor(100 + Math.random() * 800).toString(),
      mobile: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
      photoUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      location: 'Sede Principal - SP',
      birthDate: '1992-06-20',
      hireDate: new Date().toISOString().split('T')[0],
      bio: 'Novo colaborador integrado à equipe UNICCAT.',
      active: true
    });
    setShowPassword(true);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || 'uni@123',
      role: user.role,
      department: user.department,
      phone: user.phone || '(11) 3300-1000',
      extension: user.extension || '100',
      mobile: user.mobile || '(11) 98888-0000',
      photoUrl: user.photoUrl,
      location: user.location || 'Sede Principal - SP',
      birthDate: user.birthDate || '1990-01-01',
      hireDate: user.hireDate || '2023-01-01',
      bio: user.bio || '',
      active: user.active
    });
    setShowPassword(false);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('Por favor informe o nome completo do usuário.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Por favor informe um e-mail corporativo válido.');
      return;
    }

    if (!formData.password.trim() || formData.password.trim().length < 4) {
      setFormError('Por favor informe uma senha de acesso válida (mínimo 4 caracteres).');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (editingUser) {
      // Update User
      const updated: UserProfile = {
        ...editingUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        extension: formData.extension,
        mobile: formData.mobile,
        photoUrl: formData.photoUrl,
        location: formData.location,
        birthDate: formData.birthDate,
        hireDate: formData.hireDate,
        bio: formData.bio,
        active: formData.active
      };
      saveUser(updated);
      addAuditLog(currentUser, 'EDITAR_PERMISSAO', `Perfil e senha de acesso do usuário "${updated.name}" (${updated.email}) atualizados pelo administrador.`);
      setFormSuccess('Usuário e senha atualizados com sucesso!');
    } else {
      // Check duplicate email
      const existing = users.find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
      if (existing) {
        setFormError('Já existe um usuário cadastrado com este e-mail.');
        return;
      }

      // Create New User
      const newUser: UserProfile = {
        id: 'u-' + Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        extension: formData.extension,
        mobile: formData.mobile,
        photoUrl: formData.photoUrl,
        location: formData.location,
        birthDate: formData.birthDate,
        hireDate: formData.hireDate,
        bio: formData.bio,
        active: formData.active,
        createdAt: nowStr
      };
      saveUser(newUser);
      addAuditLog(currentUser, 'EDITAR_PERMISSAO', `Novo usuário "${newUser.name}" (${newUser.role} - ${newUser.department}) criado com senha customizada.`);
      setFormSuccess('Novo usuário cadastrado e ativado com sucesso!');
    }

    setTimeout(() => {
      setIsModalOpen(false);
      loadData();
    }, 1200);
  };

  const handleToggleUserActive = (user: UserProfile) => {
    const updated = { ...user, active: !user.active };
    saveUser(updated);
    addAuditLog(currentUser, 'EDITAR_PERMISSAO', `Status do usuário "${user.name}" alterado para ${updated.active ? 'Ativo' : 'Inativo'}.`);
    loadData();
  };

  const handleDeleteUserConfirm = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      deleteUser(userId);
      addAuditLog(currentUser, 'EXCLUIR_REGISTRO', `Usuário "${userToDelete.name}" (${userToDelete.email}) foi excluído pelo administrador.`);
      setDeletingUserId(null);
      loadData();
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    if (selectedDepartment !== 'all' && u.department !== selectedDepartment) return false;
    if (selectedRole !== 'all' && u.role !== selectedRole) return false;
    if (selectedStatus === 'active' && !u.active) return false;
    if (selectedStatus === 'inactive' && u.active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.extension.includes(q)
      );
    }

    return true;
  });

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.active).length;
  const adminCount = users.filter(u => u.role === 'Administrador').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Painel Administrativo & Gestão de Usuários</h1>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-full uppercase">
                Acesso Master
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cadastre e gerencie colaboradores, atribua permissões de departamento e consulte logs de segurança.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" /> Criar Usuário Único
          </button>

          <button
            onClick={() => {
              setBatchRawText('');
              setBatchError('');
              setBatchSuccess('');
              setIsBatchModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
            title="Importar múltiplos colaboradores de uma só vez (CSV / Excel / JSON)"
          >
            <FileUp className="w-4 h-4" /> Importar em Lote (CSV)
          </button>

          <button
            onClick={onOpenSqlModal}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
            title="Ver e Copiar Script SQL do Banco Supabase"
          >
            <Database className="w-4 h-4 text-emerald-600" /> Script SQL Supabase
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total de Colaboradores</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalUsers}</p>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contas Ativas</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Administradores</p>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{adminCount}</p>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Conexão Supabase</p>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {isSupabaseConfigured() ? 'Conectado (Realtime)' : 'Modo Mock / Híbrido'}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Navigation Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Gestão de Colaboradores & Acessos
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" /> Logs de Auditoria do Sistema
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'supabase'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Status Supabase & RLS
            </button>

            <button
              onClick={() => setActiveTab('glpi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'glpi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <LifeBuoy className="w-4 h-4" /> Painel GLPI Atendimentos TI
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            
            {/* Filter controls */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome, e-mail, ramal..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* Department */}
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos os Departamentos</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Role */}
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos os Cargos</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Status: Todos</option>
                  <option value="active">Somente Ativos</option>
                  <option value="inactive">Somente Inativos</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleExportUsersCSV}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs"
                  title="Exportar lista de usuários para Excel (CSV)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Usuários (CSV)</span>
                </button>
              </div>
            </div>

            {/* User List Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Colaborador</th>
                    <th className="p-3.5">Cargo / Perfil</th>
                    <th className="p-3.5">Departamento</th>
                    <th className="p-3.5">Ramal / Contato</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        
                        {/* User Photo & Name */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.role === 'Administrador' && (
                                  <BadgeCheck className="w-4 h-4 text-blue-600" title="Administrador Master" />
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'Administrador' 
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {user.department}
                        </td>

                        {/* Extension / Mobile */}
                        <td className="p-3.5">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">Ramal: {user.extension}</p>
                          <p className="text-[10px] text-slate-400">{user.mobile}</p>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleUserActive(user)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                              user.active 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{user.active ? 'Ativo' : 'Inativo'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 rounded-lg transition"
                              title="Editar Perfil de Usuário"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {user.id !== currentUser.id && (
                              <button
                                onClick={() => setDeletingUserId(user.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 rounded-lg transition"
                                title="Excluir Colaborador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Registro Contínuo de Auditoria e Segurança (Supabase RLS)</span>
              </h3>

              <button
                onClick={handleExportAuditLogsCSV}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs"
                title="Exportar logs de auditoria para Excel (CSV)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Logs (CSV)</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Usuário</th>
                    <th className="p-3">Ação</th>
                    <th className="p-3">Detalhes</th>
                    <th className="p-3">IP Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">{log.timestamp}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{log.userName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{log.details}</td>
                      <td className="p-3 text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUPABASE CONFIG */}
        {activeTab === 'supabase' && (
          <div className="p-6 space-y-6">
            
            {/* Status & Connection Credentials Box */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Conexão Supabase PostgreSQL & Realtime</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-full text-[10px]">
                        Ativo
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Integração de gravação contínua em tempo real com o banco de dados nuvem.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSupabase}
                    disabled={testingConn}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingConn ? 'animate-spin' : ''}`} />
                    <span>{testingConn ? 'Testando Conexão...' : 'Testar Leitura & Escrita'}</span>
                  </button>

                  <button
                    onClick={handleSyncAllToSupabase}
                    disabled={syncingData}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
                  >
                    <CloudUpload className={`w-4 h-4 ${syncingData ? 'animate-spin' : ''}`} />
                    <span>{syncingData ? 'Sincronizando...' : 'Forçar Sincronização Geral'}</span>
                  </button>
                </div>
              </div>

              {/* Connection Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono overflow-hidden">
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] block font-sans">URL do Supabase:</span>
                  <p className="text-slate-800 dark:text-slate-200 truncate">{supabaseUrl}</p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono overflow-hidden">
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] block font-sans">Chave de API (Anon Key):</span>
                  <p className="text-slate-800 dark:text-slate-200 truncate">{supabaseAnonKey.substring(0, 24)}...</p>
                </div>
              </div>

              {/* Test Result Banner */}
              {testResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' 
                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-sm">{testResult.message}</p>
                    {testResult.errorCode && (
                      <p className="font-mono text-[11px] opacity-80">Código do Erro: {testResult.errorCode}</p>
                    )}
                    {!testResult.success && (
                      <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                        <span>Execute o script de desbloqueio RLS no SQL Editor do Supabase para liberá-la.</span>
                        <button
                          onClick={handleCopyRlsSql}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedRlsSql ? 'Copiado!' : 'Copiar Script RLS'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Result Banner */}
              {syncResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  syncResult.success 
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300' 
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{syncResult.message}</p>
                  </div>
                </div>
              )}

              {/* Tables overview & DDL buttons */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">Tabelas Estruturadas no Schema:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.profiles</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.announcements</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.chat_rooms</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.chat_messages</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.user_presences</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.tickets</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.quick_links</div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">public.documents</div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={onOpenSqlModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
                  >
                    <Database className="w-4 h-4" /> Visualizar DDL SQL Completo & Schema
                  </button>

                  <button
                    onClick={handleCopyRlsSql}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>{copiedRlsSql ? 'Script RLS Copiado!' : 'Copiar SQL Desbloqueio RLS'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* TAB 4: GLPI HELPDESK */}
        {activeTab === 'glpi' && (
          <div className="p-6">
            <TicketsView currentUser={currentUser} />
          </div>
        )}

      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 rounded-xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingUser ? 'Editar Perfil de Colaborador' : 'Cadastrar Novo Usuário / Colaborador'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Insira os dados profissionais, cargo e ramal para acesso à Intranet UNICCAT
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Error / Success feedback */}
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Dra. Mariana Costa"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mariana.costa@uniccat.com.br"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Password Field */}
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Senha de Acesso do Usuário *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
                        let gen = 'UNiccat@';
                        for (let i = 0; i < 4; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                        setFormData({ ...formData, password: gen });
                        setShowPassword(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" /> Gerar Senha Segura
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Informe ou altere a senha de acesso..."
                      className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      title={showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Defina a senha com a qual este colaborador irá realizar login na Intranet.
                  </p>
                </div>

                {/* Role / Cargo */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cargo / Função *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Departamento UNICCAT *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Extension (Ramal) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ramal Telefônico</label>
                  <input
                    type="text"
                    value={formData.extension}
                    onChange={e => setFormData({ ...formData, extension: e.target.value })}
                    placeholder="Ex: 104"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unidade / Localização</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Sede São Paulo - SP"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-4">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status do Acesso:</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      formData.active 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{formData.active ? 'Conta Ativa' : 'Conta Inativa'}</span>
                  </button>
                </div>
              </div>

              {/* Photo Avatar Upload & Preset Selector */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Foto de Perfil (JPEG - Máx 4MB)</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full uppercase">
                    JPEG • Max 4MB
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="Foto do colaborador"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-600/40 shrink-0 shadow-xs"
                  />
                  <div className="space-y-1">
                    <input
                      ref={adminFileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleAdminImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => adminFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto JPEG</span>
                    </button>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Formatos aceitos: <strong>.jpg, .jpeg</strong> (máximo 4MB).
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Ou escolha um avatar pré-definido:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Avatar"
                        onClick={() => setFormData({ ...formData, photoUrl: url })}
                        className={`w-8 h-8 rounded-full object-cover cursor-pointer transition ring-2 ${
                          formData.photoUrl === url ? 'ring-blue-600 scale-110' : 'ring-transparent hover:opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apresentação / Resumo</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Breve descrição da especialidade ou rotina do colaborador..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* BATCH USER IMPORT MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Importação Automática de Usuários em Lote</h3>
                  <p className="text-xs text-slate-500">Cadastre múltiplos colaboradores de uma só vez colando dados em CSV/JSON ou enviando arquivo.</p>
                </div>
              </div>

              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Notification Banners */}
              {batchError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{batchError}</span>
                </div>
              )}

              {batchSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{batchSuccess}</span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Opção 1: Baixar Planilha Modelo (.csv)</h4>
                  <p className="text-[11px] text-slate-500">Baixe o modelo pré-formatado com os cabeçalhos das colunas para preencher no Excel.</p>
                </div>

                <button
                  onClick={handleDownloadTemplateCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> Baixar Modelo CSV
                </button>
              </div>

              {/* File upload or text paste */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Opção 2: Cole o Texto em Formato CSV ou Envie o Arquivo</span>
                  </label>

                  <input
                    ref={batchFileInputRef}
                    type="file"
                    accept=".csv,.txt,.json"
                    onChange={handleBatchFileUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => batchFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Enviar Arquivo .CSV / .TXT
                  </button>
                </div>

                <textarea
                  value={batchRawText}
                  onChange={e => {
                    setBatchRawText(e.target.value);
                    setBatchError('');
                    setBatchSuccess('');
                  }}
                  rows={6}
                  placeholder={`Cole aqui a lista de usuários em CSV ou JSON. Exemplo CSV:\nNome,Email,Cargo,Departamento,Ramal,Telefone,Celular,Localizacao\nJuliana Costa,juliana.costa@uniccat.com.br,Funcionário,Medicina Ocupacional,105,(11) 3300-1005,(11) 98888-1122,Sede Principal - SP\nFernando Lima,fernando.lima@uniccat.com.br,Gestor,TI / Sistemas,106,(11) 3300-1006,(11) 98888-3344,Sede Principal - SP`}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Live Preview of parsed users */}
              {batchRawText.trim().length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Pré-visualização dos Usuários Detectados: ({parseUsersFromInput(batchRawText).length})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Senha padrão gerada: <strong className="text-slate-700 dark:text-slate-300 font-mono">uni@123</strong>
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Nome</th>
                          <th className="p-2">E-mail</th>
                          <th className="p-2">Cargo</th>
                          <th className="p-2">Departamento</th>
                          <th className="p-2">Ramal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parseUsersFromInput(batchRawText).map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                            <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">{u.name}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{u.email}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{u.role}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{u.department}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400 font-mono">{u.extension}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-[11px] text-slate-500">
                Os usuários criados serão vinculados automaticamente à Intranet e Supabase.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-300 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleExecuteBatchImport}
                  disabled={parseUsersFromInput(batchRawText).length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar e Importar Todos ({parseUsersFromInput(batchRawText).length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Confirmar Exclusão de Usuário</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Esta ação removerá o colaborador da lista de usuários ativos da Intranet UNICCAT.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUserConfirm(deletingUserId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
