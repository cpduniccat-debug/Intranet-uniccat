import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Pin, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  FileText,
  Calendar,
  Send,
  Upload,
  Image as ImageIcon,
  Trash2,
  Paperclip
} from 'lucide-react';
import { Announcement, AnnouncementCategory, AnnouncementPriority, AnnouncementAttachment, UserProfile } from '../../types';
import { getAnnouncements, saveAnnouncement, deleteAnnouncement, confirmAnnouncementRead } from '../../lib/storage';

interface AnnouncementsViewProps {
  currentUser: UserProfile;
  onSelectAnnouncement: (announcement: Announcement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  currentUser,
  onSelectAnnouncement
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Todos');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Announcement Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('Comunicados');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');
  const [pinned, setPinned] = useState(false);
  const [requiresReadConfirmation, setRequiresReadConfirmation] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [attachmentName, setAttachmentName] = useState('');

  const canManage = currentUser.role === 'Administrador' || currentUser.role === 'RH';

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecione apenas arquivos de imagem (JPEG, PNG, GIF, WebP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setUploadedImages(prev => [...prev, { name: file.name, url: dataUrl }]);
          if (!coverImage) {
            setCoverImage(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (coverImage === prev[index]?.url) {
        setCoverImage(updated[0]?.url || '');
      }
      return updated;
    });
  };

  const categories = [
    'Todos',
    'Comunicados',
    'Avisos',
    'Eventos',
    'Aniversariantes',
    'Novos Colaboradores',
    'Campanhas',
    'Benefícios',
    'Feriados',
    'Treinamentos',
    'Comunicados Urgentes'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    // Build attachments array from uploaded images and PDF name if provided
    const attachments: AnnouncementAttachment[] = [];

    // Add uploaded images
    uploadedImages.forEach(img => {
      attachments.push({
        name: img.name,
        type: 'image',
        url: img.url,
        size: 'Imagem Corporativa'
      });
    });

    // Add PDF attachment if filled
    if (attachmentName) {
      attachments.push({
        name: attachmentName,
        type: 'pdf',
        url: '#',
        size: 'Documento PDF'
      });
    }

    // Determine final cover image (either explicitly specified, or first uploaded image)
    const finalCover = coverImage || (uploadedImages.length > 0 ? uploadedImages[0].url : undefined);

    const newAnc: Announcement = {
      id: 'anc-' + Date.now(),
      title,
      summary: summary || title,
      content,
      category,
      priority,
      pinned,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorPhotoUrl: currentUser.photoUrl,
      coverImage: finalCover,
      publishDate: new Date().toISOString().split('T')[0],
      allowComments: true,
      requiresReadConfirmation,
      readBy: [currentUser.id],
      attachments,
      createdAt: new Date().toISOString()
    };

    saveAnnouncement(newAnc);
    setAnnouncements(getAnnouncements());
    setCreateModalOpen(false);

    // Reset Form
    setTitle('');
    setSummary('');
    setContent('');
    setCoverImage('');
    setUploadedImages([]);
    setAttachmentName('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      deleteAnnouncement(id);
      setAnnouncements(getAnnouncements());
    }
  };

  const filtered = announcements.filter(a => {
    const matchesCat = selectedCat === 'Todos' || a.category === selectedCat;
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Comunicados e Canal da Comunicação Interna (RH)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fique por dentro das novidades, convocações, eventos e avisos corporativos da UNICCAT.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setCreateModalOpen(true)}
            id="btn-new-announcement"
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Comunicado RH</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar comunicados pelo título ou conteúdo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(a => {
          const isRead = a.readBy?.includes(currentUser.id);

          return (
            <div
              key={a.id}
              onClick={() => onSelectAnnouncement(a)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl overflow-hidden shadow-sm transition duration-200 cursor-pointer flex flex-col justify-between group"
            >
              {a.coverImage && (
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  {a.pinned && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded uppercase flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Fixado
                    </span>
                  )}
                  {a.priority === 'Urgente' && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded uppercase flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Urgente
                    </span>
                  )}
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded uppercase">
                      {a.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {a.publishDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-2 transition">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                    {a.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={a.authorPhotoUrl} alt={a.authorName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{a.authorName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManage && (
                      <button
                        onClick={(e) => handleDelete(e, a.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Excluir Comunicado"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isRead ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {isRead ? 'Lido' : 'Não Lido'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating Announcement */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <Megaphone className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Publicar Novo Comunicado RH</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Comunicado</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Campanha de Vacinação Ocupacional 2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Resumo Executivo (Exibido nos Cards)</label>
                <input
                  type="text"
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Breve resumo para chamada..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conteúdo Completo</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escreva a mensagem completa..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Image Upload Field */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Anexar Imagens / Fotos no Comunicado (JPEG, PNG, max 4MB)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {uploadedImages.length} imagem(ns) selecionada(s)
                  </span>
                </div>

                {/* Upload Button Box */}
                <div className="relative border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 rounded-xl p-4 text-center transition cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="p-2.5 bg-slate-800 group-hover:bg-cyan-950 text-slate-400 group-hover:text-cyan-400 rounded-full transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">
                      Clique para selecionar imagens do computador
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Suporta arquivos JPEG, PNG, GIF, WEBP
                    </p>
                  </div>
                </div>

                {/* Uploaded Images Preview Thumbnails */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-20">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs opacity-90 transition"
                          title="Remover imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="absolute bottom-0 inset-x-0 p-1 bg-slate-950/80 text-[9px] text-slate-300 truncate">
                          {img.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ou URL de Capa Externa (Opcional)</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome do Anexo PDF (Opcional)</label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={e => setAttachmentName(e.target.value)}
                    placeholder="Ex: Regulamento_Interno.pdf"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={e => setPinned(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500"
                  />
                  <span className="text-slate-300 font-semibold">Fixar no Topo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresReadConfirmation}
                    onChange={e => setRequiresReadConfirmation(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500"
                  />
                  <span className="text-slate-300 font-semibold">Exigir Confirmação de Leitura</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-teal-950"
                >
                  <Send className="w-3.5 h-3.5" /> Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
