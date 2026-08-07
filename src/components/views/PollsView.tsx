import React, { useState } from 'react';
import { 
  Vote, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  BarChart3, 
  Sparkles, 
  Copy, 
  Trash2, 
  Eye, 
  Check, 
  Send, 
  AlertCircle,
  FolderPlus,
  ArrowRight,
  Layers,
  Settings2,
  Share2,
  RefreshCw,
  HelpCircle,
  Star,
  Download
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';
import { Poll, UserProfile, PollType } from '../../types';
import { 
  getPolls, 
  votePoll, 
  addPoll, 
  updatePoll, 
  deletePoll, 
  submitGoogleFormResponse 
} from '../../lib/storage';

interface PollsViewProps {
  currentUser: UserProfile;
}

export const PollsView: React.FC<PollsViewProps> = ({ currentUser }) => {
  const [polls, setPolls] = useState<Poll[]>(() => getPolls());
  const [activeTab, setActiveTab] = useState<'all' | 'google_forms' | 'templates' | 'standard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewFormModal, setViewFormModal] = useState<Poll | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form builder state inside modal
  const [createType, setCreateType] = useState<PollType>('google_forms');
  const [formQuestion, setFormQuestion] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('RH & Gestão');
  const [formGoogleUrl, setFormGoogleUrl] = useState('');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [isTemplate, setIsTemplate] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['Opção 1', 'Opção 2']);

  // Embedded form response answers state
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const reloadPolls = () => {
    setPolls(getPolls());
  };

  const handleVote = (pollId: string, optionId: string) => {
    votePoll(pollId, optionId, currentUser.id);
    reloadPolls();
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    let newPoll: Poll;

    if (createType === 'google_forms') {
      newPoll = {
        id: 'form-' + Date.now(),
        question: formQuestion,
        description: formDescription || 'Formulário integrado via Google Forms.',
        category: formCategory,
        type: 'google_forms',
        googleFormUrl: formGoogleUrl.trim() || 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE/viewform?embedded=true',
        active: true,
        endDate: formEndDate,
        votedUserIds: [],
        options: [],
        responsesCount: 0,
        authorName: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
        isTemplate: isTemplate,
        embeddedFormQuestions: [
          { id: 'q1', title: 'Como você avalia este tema?', type: 'rating', required: true },
          { id: 'q2', title: 'Qual a sua opinião ou sugestão principal?', type: 'text', required: false }
        ]
      };
    } else if (createType === 'template') {
      newPoll = {
        id: 'tpl-' + Date.now(),
        question: `[Modelo Google Forms] ${formQuestion}`,
        description: formDescription || 'Modelo padronizado do Google Forms para uso interno na UNICCAT.',
        category: formCategory,
        type: 'template',
        isTemplate: true,
        templateCategory: formCategory,
        googleFormUrl: formGoogleUrl.trim() || 'https://docs.google.com/forms/d/e/1FAIpQLSc_MODELO/viewform?embedded=true',
        active: true,
        endDate: formEndDate,
        votedUserIds: [],
        options: [],
        responsesCount: 0,
        authorName: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
        embeddedFormQuestions: [
          { id: 'q1', title: 'Nível de satisfação geral (1 a 5)', type: 'rating', required: true },
          { id: 'q2', title: 'Qual o principal ponto positivo?', type: 'text', required: true }
        ]
      };
    } else {
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      newPoll = {
        id: 'poll-' + Date.now(),
        question: formQuestion,
        description: formDescription,
        category: formCategory,
        type: 'standard',
        active: true,
        endDate: formEndDate,
        votedUserIds: [],
        options: validOptions.map((optText, idx) => ({
          id: `opt-${idx + 1}`,
          text: optText,
          votes: 0
        })),
        authorName: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    addPoll(newPoll);
    reloadPolls();
    setCreateModalOpen(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setFormQuestion('');
    setFormDescription('');
    setFormCategory('RH & Gestão');
    setFormGoogleUrl('');
    setFormEndDate('2026-12-31');
    setIsTemplate(false);
    setPollOptions(['Opção 1', 'Opção 2']);
  };

  const handleUseTemplate = (tpl: Poll) => {
    const cloned: Poll = {
      ...tpl,
      id: 'form-' + Date.now(),
      question: tpl.question.replace('[Modelo Google Forms] ', ''),
      type: 'google_forms',
      isTemplate: false,
      responsesCount: 0,
      votedUserIds: [],
      authorName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0]
    };
    addPoll(cloned);
    reloadPolls();
    alert(`O modelo "${tpl.question}" foi duplicado e ativado como uma nova pesquisa para a sua equipe!`);
  };

  const handleToggleStatus = (p: Poll) => {
    updatePoll({ ...p, active: !p.active });
    reloadPolls();
  };

  const handleDeletePoll = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pesquisa/enquete?')) {
      deletePoll(id);
      reloadPolls();
    }
  };

  const handleSubmitEmbeddedForm = (pollId: string) => {
    submitGoogleFormResponse(pollId, currentUser.id);
    reloadPolls();
    setFormSubmitted(true);
  };

  const copyUrlToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter polls
  const filteredPolls = polls.filter(p => {
    const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    if (!matchesSearch || !matchesCategory) return false;

    if (activeTab === 'google_forms') return p.type === 'google_forms' && !p.isTemplate;
    if (activeTab === 'templates') return p.type === 'template' || p.isTemplate;
    if (activeTab === 'standard') return p.type === 'standard' || (!p.type && p.options.length > 0);

    return true;
  });

  const activeCount = polls.filter(p => p.active && !p.isTemplate).length;
  const formsCount = polls.filter(p => p.type === 'google_forms' && !p.isTemplate).length;
  const templatesCount = polls.filter(p => p.isTemplate || p.type === 'template').length;

  const handleExportPollsCSV = () => {
    const headers = [
      'ID Pesquisa', 'Título / Pergunta', 'Descrição', 'Categoria', 'Tipo',
      'Total Votos / Respostas', 'Data Validade', 'Status'
    ];

    const rows = filteredPolls.map(p => [
      p.id,
      p.question,
      p.description || '',
      p.category,
      p.type === 'google_forms' ? 'Google Forms Integrado' : p.isTemplate ? 'Modelo Próprio' : 'Enquete Direta',
      p.votedUserIds ? p.votedUserIds.length : 0,
      p.endDate || 'Sem Prazo Limite',
      p.active ? 'Ativa' : 'Encerrada'
    ]);

    exportToCSV('pesquisas_e_enquetes_uniccat', headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Banner / Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-purple-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold backdrop-blur-sm">
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-300" />
              <span>Integração Nativa Google Forms & Enquetes UNICCAT</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enquetes, Pesquisas & Formulários Integrados
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Crie pesquisas com Google Forms diretamente dentro da intranet, utilize modelos corporativos pré-definidos do Google Forms ou lance enquetes rápidas para coletar a opinião dos colaboradores sem sair do aplicativo.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-purple-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>{activeCount}</strong> Pesquisas Ativas</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <FileSpreadsheet className="w-4 h-4 text-purple-300" />
                <span><strong>{formsCount}</strong> Google Forms</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span><strong>{templatesCount}</strong> Modelos Prontos</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={handleExportPollsCSV}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
              title="Exportar dados e resultados das pesquisas para Excel (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Pesquisas (CSV)
            </button>
            <button
              onClick={() => {
                resetCreateForm();
                setCreateModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nova Pesquisa / Google Form
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Modelos Google Forms
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar & Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Todas ({polls.length})
            </button>

            <button
              onClick={() => setActiveTab('google_forms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'google_forms'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-400" /> Google Forms Integrados ({formsCount})
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Modelos Prontos ({templatesCount})
            </button>

            <button
              onClick={() => setActiveTab('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'standard'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Vote className="w-4 h-4 text-emerald-400" /> Enquetes Rápidas ({polls.filter(p => p.type === 'standard' || (!p.type && p.options.length > 0)).length})
            </button>
          </div>

          <button
            onClick={reloadPolls}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, palavra-chave ou autor..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">Todas as Categorias</option>
              <option value="RH & Desenvolvimento">RH & Desenvolvimento</option>
              <option value="Gestão de Pessoas">Gestão de Pessoas</option>
              <option value="Tecnologia da Informação">Tecnologia da Informação</option>
              <option value="Benefícios RH">Benefícios RH</option>
              <option value="Eventos & Social">Eventos & Social</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400">
            <span>Exibindo <strong>{filteredPolls.length}</strong> itens</span>
          </div>
        </div>

      </div>

      {/* Grid of Surveys / Polls / Google Forms */}
      {filteredPolls.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum formulário ou enquete encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Tente redefinir os filtros ou clique no botão abaixo para adicionar um novo formulário do Google Forms ou modelo.
            </p>
          </div>
          <button
            onClick={() => {
              resetCreateForm();
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Google Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map((p) => {
            const isGoogleForm = p.type === 'google_forms';
            const isTpl = p.isTemplate || p.type === 'template';
            const hasResponded = p.votedUserIds.includes(currentUser.id);
            const totalVotes = p.options ? p.options.reduce((sum, o) => sum + o.votes, 0) : 0;

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition duration-200 shadow-sm flex flex-col justify-between overflow-hidden relative group ${
                  isTpl 
                    ? 'border-amber-200 dark:border-amber-900/40 hover:border-amber-400' 
                    : isGoogleForm
                      ? 'border-purple-200 dark:border-purple-900/40 hover:border-purple-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                {/* Header Badge Strip */}
                <div className={`px-5 py-3 border-b flex items-center justify-between text-xs font-semibold ${
                  isTpl
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                    : isGoogleForm
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/30 text-purple-800 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {isTpl ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Modelo do Google Forms</span>
                      </>
                    ) : isGoogleForm ? (
                      <>
                        <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Google Forms Integrado</span>
                      </>
                    ) : (
                      <>
                        <Vote className="w-4 h-4 text-emerald-500" />
                        <span>Enquete Interna</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {p.category}
                    </span>
                    {p.active ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ativa
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Encerrada</span>
                    )}
                  </div>
                </div>

                {/* Main Content Body */}
                <div className="p-5 space-y-4 flex-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition leading-snug">
                      {p.question}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Template Details or Google Form URL Box */}
                  {(isGoogleForm || isTpl) && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ExternalLink className="w-3.5 h-3.5 text-purple-500" /> URL do Formulário Google:
                        </span>
                        <button
                          onClick={() => copyUrlToClipboard(p.googleFormUrl || '', p.id)}
                          className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedId === p.id ? 'Copiado!' : 'Copiar Link'}
                        </button>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                        {p.googleFormUrl || 'https://docs.google.com/forms/d/e/.../viewform'}
                      </div>
                    </div>
                  )}

                  {/* Standard Poll Options & Voting */}
                  {(!isGoogleForm && !isTpl) && (
                    <div className="space-y-2.5 pt-1">
                      {p.options.map((opt) => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <div key={opt.id} className="space-y-1">
                            <button
                              disabled={hasResponded || !p.active}
                              onClick={() => handleVote(p.id, opt.id)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition relative overflow-hidden flex items-center justify-between gap-3 ${
                                hasResponded
                                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-default'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30'
                              }`}
                            >
                              {/* Background Percentage Fill */}
                              {hasResponded && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-purple-500/15 dark:bg-purple-500/25 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              )}
                              
                              <span className="relative z-10 text-slate-800 dark:text-slate-200 truncate">{opt.text}</span>
                              <div className="relative z-10 flex items-center gap-2 shrink-0">
                                {hasResponded && (
                                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">{pct}% ({opt.votes})</span>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                      
                      {hasResponded && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Seu voto foi registrado com sucesso! Total: {totalVotes} votos
                        </p>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Atél {p.endDate}
                    </span>
                    {isGoogleForm && (
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        {p.responsesCount || 0} respostas
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Admin / Author delete option */}
                    {(currentUser.role === 'Administrador' || p.authorName === currentUser.name) && (
                      <button
                        onClick={() => handleDeletePoll(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isTpl ? (
                      <button
                        onClick={() => handleUseTemplate(p)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Usar Modelo
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setViewFormModal(p);
                          setFormAnswers({});
                          setFormSubmitted(false);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        {isGoogleForm ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {isGoogleForm ? 'Responder no App' : 'Ver Detalhes'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: View / Fill Google Form Inside App */}
      {viewFormModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Form Header Bar (Google Forms Purple Theme) */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 space-y-2 relative">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  <FileSpreadsheet className="w-3 h-3" /> Google Forms Integrado
                </div>
                <button
                  onClick={() => setViewFormModal(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              <h2 className="text-xl font-bold">{viewFormModal.question}</h2>
              {viewFormModal.description && (
                <p className="text-xs text-purple-100 leading-relaxed">{viewFormModal.description}</p>
              )}

              <div className="flex items-center justify-between text-[11px] text-purple-200 pt-2 border-t border-white/10">
                <span>Categoria: <strong>{viewFormModal.category}</strong></span>
                <span>Organizado por: <strong>{viewFormModal.authorName || 'UNICCAT'}</strong></span>
              </div>
            </div>

            {/* Form Content / iFrame Player / Fallback Interactive Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {formSubmitted ? (
                <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sua resposta foi registrada com sucesso!</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Obrigado por contribuir. Suas respostas foram computadas com segurança no sistema da UNICCAT.
                    </p>
                  </div>
                  <button
                    onClick={() => setViewFormModal(null)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                  >
                    Fechar Formulário
                  </button>
                </div>
              ) : (
                <>
                  {/* Google Forms Option 1: Embedded IFrame view if link exists */}
                  {viewFormModal.googleFormUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ExternalLink className="w-4 h-4 text-purple-600" /> Formulário Incorporado Oficial
                        </span>
                        <a
                          href={viewFormModal.googleFormUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                        >
                          Abrir no Google Forms <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="w-full h-[380px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                        <iframe
                          src={viewFormModal.googleFormUrl}
                          className="w-full h-full border-0"
                          title={viewFormModal.question}
                        />
                      </div>
                    </div>
                  )}

                  {/* Google Forms Option 2: Internal Native Question Fields (for seamless response inside app) */}
                  {viewFormModal.embeddedFormQuestions && viewFormModal.embeddedFormQuestions.length > 0 && (
                    <div className="p-5 bg-purple-50/50 dark:bg-slate-950/60 rounded-2xl border border-purple-100 dark:border-slate-800 space-y-5">
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" /> Resposta Direta Interna UNICCAT
                      </h4>

                      {viewFormModal.embeddedFormQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <label className="block text-xs font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {q.title} {q.required && <span className="text-red-500">*</span>}
                          </label>

                          {q.type === 'rating' && (
                            <div className="flex items-center gap-2 pt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFormAnswers({ ...formAnswers, [q.id]: star })}
                                  className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                                    formAnswers[q.id] === star
                                      ? 'bg-purple-600 text-white border-purple-600'
                                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-400'
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${formAnswers[q.id] === star ? 'fill-current' : ''}`} /> {star}
                                </button>
                              ))}
                            </div>
                          )}

                          {q.type === 'choice' && q.options && (
                            <div className="space-y-1.5 pt-1">
                              {q.options.map((opt, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 hover:bg-purple-50/50 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={formAnswers[q.id] === opt}
                                    onChange={() => setFormAnswers({ ...formAnswers, [q.id]: opt })}
                                    className="text-purple-600 focus:ring-purple-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {q.type === 'text' && (
                            <textarea
                              rows={2}
                              value={formAnswers[q.id] || ''}
                              onChange={(e) => setFormAnswers({ ...formAnswers, [q.id]: e.target.value })}
                              placeholder="Digite sua resposta aqui..."
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => handleSubmitEmbeddedForm(viewFormModal.id)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Enviar Respostas no Sistema
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>UNICCAT Forms • Integrado com Google Workspace</span>
              <button
                onClick={() => setViewFormModal(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Create New Poll / Google Form / Template */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Pesquisa ou Form</h2>
                  <p className="text-xs text-slate-500">Integre links do Google Forms ou crie enquetes internas</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              
              {/* Type Selection Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCreateType('google_forms')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    createType === 'google_forms'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Google Forms
                </button>

                <button
                  type="button"
                  onClick={() => setCreateType('template')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    createType === 'template'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Modelo Pronto
                </button>

                <button
                  type="button"
                  onClick={() => setCreateType('standard')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    createType === 'standard'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" /> Enquete Simples
                </button>
              </div>

              {/* Common Fields */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Título da Pesquisa / Pergunta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ex: Pesquisa de Clima do Setor de Atendimento..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Descrição ou Instruções
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Orientações aos colaboradores para o preenchimento..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Google Form Specific URL */}
              {(createType === 'google_forms' || createType === 'template') && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    URL do Google Forms (Link para incorporação/viewform)
                  </label>
                  <input
                    type="url"
                    value={formGoogleUrl}
                    onChange={(e) => setFormGoogleUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?embedded=true"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Dica: No Google Forms, clique em "Enviar" &gt; símbolo de incorporação (&lt;/&gt;) e copie a URL gerada.
                  </p>
                </div>
              )}

              {/* Standard Poll Options */}
              {createType === 'standard' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Opções de Votação
                  </label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        placeholder={`Opção ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, `Opção ${pollOptions.length + 1}`])}
                      className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 pt-1"
                    >
                      + Adicionar outra opção
                    </button>
                  )}
                </div>
              )}

              {/* Category & End Date */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Categoria / Setor
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="RH & Desenvolvimento">RH & Desenvolvimento</option>
                    <option value="Gestão de Pessoas">Gestão de Pessoas</option>
                    <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                    <option value="Benefícios RH">Benefícios RH</option>
                    <option value="Eventos & Social">Eventos & Social</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Cadastrar Formulário
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
