import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  FileText, 
  Download, 
  CheckCircle2, 
  X, 
  Upload, 
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  Image,
  Video,
  Archive
} from 'lucide-react';
import { DocumentFile, DocumentCategory, Department, FileType, UserProfile } from '../../types';
import { getDocuments, saveDocument, deleteDocument, confirmDocumentRead } from '../../lib/storage';

interface DocumentLibraryViewProps {
  currentUser: UserProfile;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<DocumentFile[]>(getDocuments());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Todos');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New Document Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('POP');
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [department, setDepartment] = useState<Department>(currentUser.department);
  const [mandatoryReading, setMandatoryReading] = useState(false);
  const [version, setVersion] = useState('v1.0');

  const canManage = currentUser.role === 'Administrador' || currentUser.role === 'RH' || currentUser.role === 'Coordenador';

  const categories = [
    'Todos',
    'RH',
    'Financeiro',
    'Comercial',
    'Jurídico',
    'Qualidade',
    'Documentos Internos',
    'Formulários',
    'POP',
    'Manuais',
    'Treinamentos'
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newDoc: DocumentFile = {
      id: 'doc-' + Date.now(),
      title,
      description,
      category,
      fileType,
      fileSize,
      downloadUrl: '#',
      authorName: currentUser.name,
      department,
      version,
      downloadsCount: 0,
      mandatoryReading,
      confirmedReaders: [currentUser.id],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    saveDocument(newDoc);
    setDocuments(getDocuments());
    setUploadModalOpen(false);

    setTitle('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este documento da biblioteca?')) {
      deleteDocument(id);
      setDocuments(getDocuments());
    }
  };

  const handleConfirmRead = (docId: string) => {
    confirmDocumentRead(docId, currentUser.id);
    setDocuments(getDocuments());
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'excel': return FileSpreadsheet;
      case 'word': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'zip': return Archive;
      default: return FileCode;
    }
  };

  const filtered = documents.filter(d => {
    const matchesCat = selectedCat === 'Todos' || d.category === selectedCat;
    const matchesSearch = 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950 border border-amber-800 rounded-2xl text-amber-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Central de Documentos, POPs e Formulários
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Repositório institucional de manuais, procedimentos operacionais padrão e arquivos da UNICCAT.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setUploadModalOpen(true)}
            id="btn-upload-document"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Enviar Novo Documento</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar documentos pelo nome, código ou descrição..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {filtered.map(doc => {
            const Icon = getFileIcon(doc.fileType);
            const isRead = doc.confirmedReaders?.includes(currentUser.id);

            return (
              <div 
                key={doc.id}
                className="p-4 sm:p-5 hover:bg-slate-800/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white hover:text-amber-300 transition cursor-pointer">
                        {doc.title}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded">
                        {doc.version}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-950 border border-amber-800/80 text-amber-300 text-[10px] font-bold uppercase rounded">
                        {doc.category}
                      </span>
                      {doc.mandatoryReading && (
                        <span className="px-2 py-0.5 bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Leitura Obrigatória
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {doc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Setor: <strong className="text-slate-300">{doc.department}</strong></span>
                      <span>Autor: <strong className="text-slate-300">{doc.authorName}</strong></span>
                      <span>Tamanho: <strong className="text-slate-300">{doc.fileSize}</strong></span>
                      <span>Downloads: <strong className="text-slate-300">{doc.downloadsCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {doc.mandatoryReading && (
                    <button
                      onClick={() => handleConfirmRead(doc.id)}
                      disabled={isRead}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isRead
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRead ? 'Lido' : 'Confirmar Leitura'}</span>
                    </button>
                  )}

                  <a
                    href={doc.downloadUrl}
                    download
                    onClick={() => {
                      doc.downloadsCount += 1;
                      saveDocument(doc);
                      setDocuments(getDocuments());
                    }}
                    className="px-3.5 py-1.5 bg-amber-950 border border-amber-800 hover:bg-amber-900 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  {canManage && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Excluir documento"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Upload de Documento Institucional</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: POP-MED-005: Exames Complementares"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Arquivo</label>
                  <select
                    value={fileType}
                    onChange={e => setFileType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="word">Word (.docx)</option>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="powerpoint">PowerPoint (.pptx)</option>
                    <option value="image">Imagem (.png, .jpg)</option>
                    <option value="zip">Arquivo ZIP (.zip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Instruções de uso e finalidade do arquivo..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Versão</label>
                  <input
                    type="text"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    placeholder="v1.0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tamanho Estimado</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={e => setFileSize(e.target.value)}
                    placeholder="2.1 MB"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mandatoryReading}
                    onChange={e => setMandatoryReading(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-amber-500"
                  />
                  <span className="text-slate-300 font-semibold">Exigir Leitura Obrigatória para a equipe</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Enviar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
