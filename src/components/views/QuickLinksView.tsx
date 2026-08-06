import React, { useState } from 'react';
import { 
  Link2, 
  Plus, 
  ExternalLink, 
  Globe, 
  Activity, 
  Stethoscope, 
  Mail, 
  FileCheck, 
  Clock, 
  Star, 
  X, 
  Check, 
  Layers
} from 'lucide-react';
import { QuickLink, UserProfile } from '../../types';
import { getQuickLinks, saveQuickLink, deleteQuickLink, getUserFavorites, toggleUserFavorite } from '../../lib/storage';

interface QuickLinksViewProps {
  currentUser: UserProfile;
}

export const QuickLinksView: React.FC<QuickLinksViewProps> = ({ currentUser }) => {
  const [links, setLinks] = useState<QuickLink[]>(getQuickLinks());
  const [favorites, setFavorites] = useState<string[]>(getUserFavorites(currentUser.id));
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Link Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('Globe');
  const [category, setCategory] = useState<'Sistemas Internos' | 'Portais' | 'Ferramentas' | 'RH' | 'Externo'>('Sistemas Internos');
  const [badge, setBadge] = useState('');

  const canManage = currentUser.role === 'Administrador' || currentUser.role === 'RH';

  const handleToggleFavorite = (id: string) => {
    toggleUserFavorite(currentUser.id, id);
    setFavorites(getUserFavorites(currentUser.id));
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const newLink: QuickLink = {
      id: 'ql-' + Date.now(),
      title,
      description,
      url,
      iconName,
      category,
      isOfficial: true,
      order: links.length + 1,
      openInNewTab: true,
      badge: badge || undefined
    };

    saveQuickLink(newLink);
    setLinks(getQuickLinks());
    setAddModalOpen(false);
    setTitle('');
    setDescription('');
    setUrl('');
    setBadge('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja excluir este link rápido?')) {
      deleteQuickLink(id);
      setLinks(getQuickLinks());
    }
  };

  const categories = ['Todos', 'Favoritos', 'Sistemas Internos', 'Portais', 'Ferramentas', 'RH', 'Externo'];

  const filteredLinks = links.filter(l => {
    if (selectedCategory === 'Todos') return true;
    if (selectedCategory === 'Favoritos') return favorites.includes(l.id);
    return l.category === selectedCategory;
  });

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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-2xl text-cyan-400">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Área de Links Rápidos & Atalhos Corporativos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesse os sistemas de medicina ocupacional, ponto eletrônico, webmail e ferramentas da UNICCAT.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setAddModalOpen(true)}
            id="btn-add-quick-link"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Link</span>
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'Favoritos' && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLinks.map(link => {
          const IconComp = getIcon(link.iconName);
          const isFav = favorites.includes(link.id);

          return (
            <div
              key={link.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl shadow-lg transition duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 group-hover:scale-105 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(link.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition"
                      title={isFav ? 'Remover dos favoritos' : 'Favoritar link'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {canManage && (
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                        title="Excluir link"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-white group-hover:text-cyan-300">
                    {link.title}
                  </span>
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-300 text-[9px] font-bold uppercase rounded">
                      {link.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {link.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {link.category}
                </span>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>Abrir Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Link Modal */}
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
              <span>Cadastrar Novo Link Rápido</span>
            </h3>

            <form onSubmit={handleAddLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Sistema / Link</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Portal de Exames Complementares"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Endereço URL</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Objetivo principal do link..."
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
                    <option value="Sistemas Internos">Sistemas Internos</option>
                    <option value="Portais">Portais</option>
                    <option value="Ferramentas">Ferramentas</option>
                    <option value="RH">RH</option>
                    <option value="Externo">Externo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Selo / Badge (Opcional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="Ex: Novo, Local, Ponto"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
                  Salvar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
