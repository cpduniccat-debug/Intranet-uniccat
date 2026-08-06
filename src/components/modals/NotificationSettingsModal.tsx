import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Globe, 
  Check, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Megaphone, 
  Cake, 
  LifeBuoy, 
  Calendar, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { UserProfile, NotificationPreferences } from '../../types';
import { getNotificationPreferences, saveNotificationPreferences } from '../../lib/storage';
import { playNotificationChime, requestBrowserNotificationPermission, triggerPushNotification } from '../../lib/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => 
    getNotificationPreferences(currentUser.id)
  );
  const [browserPermission, setBrowserPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrefs(getNotificationPreferences(currentUser.id));
      if ('Notification' in window) {
        setBrowserPermission(Notification.permission);
      }
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRequestBrowserPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    if (granted) {
      triggerPushNotification('UNICCAT Intranet - Permissão Concedida! 🎉', {
        body: 'Você receberá notificações nativas no seu desktop de comunicados e mensagens.',
      });
      setPrefs(prev => ({ ...prev, enableBrowserPush: true }));
    }
  };

  const handleTestSound = () => {
    playNotificationChime();
  };

  const handleTestPush = () => {
    playNotificationChime();
    triggerPushNotification('UNICCAT - Notificação de Teste 💬', {
      body: 'As notificações por Push Nativo e alertas sonoros estão ativas no seu navegador.',
    });
  };

  const handleSave = () => {
    saveNotificationPreferences(currentUser.id, prefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Preferências de Notificações Push & Sons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure os alertas nativos do navegador, avisos sonoros e canais de notificação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          
          {/* Main Delivery Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Canais de Transmissão de Notificações</span>
            </h4>

            {/* Native Browser Push */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Notificações Push do Navegador / Desktop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Exibe banners nativos do sistema operacional quando houver novas mensagens ou comunicados urgentes.
                  </p>
                  {browserPermission !== 'granted' && (
                    <button
                      onClick={handleRequestBrowserPermission}
                      className="mt-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Autorizar Notificações no Navegador
                    </button>
                  )}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.enableBrowserPush}
                  onChange={() => handleToggle('enableBrowserPush')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sound Alerts */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white">Sinal Sonoro de Alerta (Audio Chime)</p>
                    <button
                      onClick={handleTestSound}
                      className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Ouvir som de teste"
                    >
                      <Play className="w-3 h-3" /> Testar Som
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Toca um aviso sonoro suave quando um novo comunicado ou mensagem de chat for recebida.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.enableSound}
                  onChange={() => handleToggle('enableSound')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Floating Toast */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Cards Flutuantes na Tela (In-App Toast)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Exibe um balão flutuante no canto inferior da tela em tempo real dentro da Intranet.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prefs.enableInAppToast}
                  onChange={() => handleToggle('enableInAppToast')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Categorias de Eventos e Notificações
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chat */}
              <div 
                onClick={() => handleToggle('categoryChat')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryChat 
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Mensagens de Chat Direto</p>
                    <p className="text-[10px] text-slate-500">Bate-papo individual e em grupos</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryChat} readOnly className="rounded text-blue-600" />
              </div>

              {/* Announcements */}
              <div 
                onClick={() => handleToggle('categoryAnnouncements')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryAnnouncements 
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Comunicados & Avisos RH</p>
                    <p className="text-[10px] text-slate-500">Publicações corporativas oficiais</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryAnnouncements} readOnly className="rounded text-blue-600" />
              </div>

              {/* Birthdays */}
              <div 
                onClick={() => handleToggle('categoryBirthdays')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryBirthdays 
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cake className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Aniversariantes do Dia</p>
                    <p className="text-[10px] text-slate-500">Avisos de aniversários de colegas</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryBirthdays} readOnly className="rounded text-blue-600" />
              </div>

              {/* Tickets */}
              <div 
                onClick={() => handleToggle('categoryTickets')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryTickets 
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LifeBuoy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Suporte & Chamados TI/RH</p>
                    <p className="text-[10px] text-slate-500">Atualizações nos seus chamados</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryTickets} readOnly className="rounded text-blue-600" />
              </div>

              {/* Calendar */}
              <div 
                onClick={() => handleToggle('categoryCalendar')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryCalendar 
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Agenda & Treinamentos</p>
                    <p className="text-[10px] text-slate-500">Lembretes de reuniões e cursos</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryCalendar} readOnly className="rounded text-blue-600" />
              </div>

              {/* Urgent Critical */}
              <div 
                onClick={() => handleToggle('categoryCritical')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  prefs.categoryCritical 
                    ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Alertas Urgentes</p>
                    <p className="text-[10px] text-slate-500">Prioridade máxima e avisos de sistema</p>
                  </div>
                </div>
                <input type="checkbox" checked={prefs.categoryCritical} readOnly className="rounded text-rose-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleTestPush}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Bell className="w-4 h-4 text-blue-600" /> Testar Notificação Completa
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Preferências'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
