import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Download, 
  Send,
  Pin,
  AlertTriangle
} from 'lucide-react';
import { Announcement, UserProfile } from '../../types';
import { confirmAnnouncementRead, addAnnouncementComment } from '../../lib/storage';

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  onClose,
  currentUser,
  onRefresh
}) => {
  const [commentText, setCommentText] = useState('');

  if (!announcement) return null;

  const isReadByMe = announcement.readBy?.includes(currentUser.id) || false;

  const handleConfirmRead = () => {
    confirmAnnouncementRead(announcement.id, currentUser.id);
    onRefresh();
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addAnnouncementComment(announcement.id, commentText.trim(), currentUser);
    setCommentText('');
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 my-8 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Cover Image Header if exists */}
        {announcement.coverImage ? (
          <div className="relative h-48 sm:h-64 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
            <img
              src={announcement.coverImage}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-700 dark:text-slate-200 rounded-full backdrop-blur border border-slate-200 dark:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-700 text-white font-bold text-xs rounded-lg uppercase tracking-wide">
                {announcement.category}
              </span>
              {announcement.priority === 'Urgente' && (
                <span className="px-2.5 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg uppercase tracking-wide flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Urgente
                </span>
              )}
              {announcement.pinned && (
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wide flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5" /> Fixado
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded uppercase tracking-wide">
                  {announcement.category}
                </span>
                {announcement.priority === 'Urgente' && (
                  <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-[10px] rounded uppercase tracking-wide">
                    Urgente
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{announcement.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-sm">
          
          {announcement.coverImage && (
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{announcement.title}</h2>
          )}

          {/* Author & Date metadata */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <img
                src={announcement.authorPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={announcement.authorName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{announcement.authorName}</p>
                <p className="text-blue-700 dark:text-blue-400 font-medium text-[11px]">{announcement.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{announcement.publishDate}</span>
            </div>
          </div>

          {/* Body Text */}
          <div className="prose max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
            {announcement.content}
          </div>

          {/* Image Gallery and Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              
              {/* Image Attachments Gallery */}
              {announcement.attachments.some(att => att.type === 'image' || att.url.startsWith('data:image/') || att.url.match(/\.(jpeg|jpg|gif|png|webp)/i)) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Galeria de Imagens da Comunicação</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {announcement.attachments
                      .filter(att => att.type === 'image' || att.url.startsWith('data:image/') || att.url.match(/\.(jpeg|jpg|gif|png|webp)/i))
                      .map((imgAtt, idx) => (
                        <div 
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-xs"
                        >
                          <img
                            src={imgAtt.url || undefined}
                            alt={imgAtt.name}
                            className="w-full h-36 object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <a
                              href={imgAtt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-bold text-xs shadow-md flex items-center gap-1 hover:bg-slate-100"
                            >
                              Ampliar / Ver Imagem
                            </a>
                          </div>
                          <p className="p-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 truncate border-t border-slate-100 dark:border-slate-800">
                            {imgAtt.name}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Document / File Attachments */}
              {announcement.attachments.some(att => att.type !== 'image' && !att.url.startsWith('data:image/') && !att.url.match(/\.(jpeg|jpg|gif|png|webp)/i)) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Documentos e Arquivos Anexos</span>
                  </h4>
                  <div className="space-y-2">
                    {announcement.attachments
                      .filter(att => att.type !== 'image' && !att.url.startsWith('data:image/') && !att.url.match(/\.(jpeg|jpg|gif|png|webp)/i))
                      .map((att, idx) => (
                        <div 
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-700 dark:text-blue-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{att.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{att.size || 'Arquivo Corporativo'}</p>
                            </div>
                          </div>

                          <a
                            href={att.url}
                            download
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Read Confirmation Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Confirmação de Leitura</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isReadByMe 
                  ? 'Você já confirmou a leitura deste comunicado.' 
                  : 'Este comunicado requer confirmação de leitura corporativa.'}
              </p>
            </div>

            <button
              onClick={handleConfirmRead}
              disabled={isReadByMe}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                isReadByMe
                  ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isReadByMe ? 'Leitura Confirmada' : 'Confirmar Leitura'}</span>
            </button>
          </div>

          {/* Comments Thread */}
          {announcement.allowComments && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Comentários ({announcement.comments?.length || 0})</span>
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {announcement.comments && announcement.comments.length > 0 ? (
                  announcement.comments.map(cm => (
                    <div key={cm.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <img src={cm.userPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={cm.userName} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{cm.userName}</p>
                          <span className="text-[10px] text-slate-400">{cm.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{cm.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum comentário até o momento. Seja o primeiro a comentar!</p>
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escreva seu comentário corporativo..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
