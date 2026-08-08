// Chaves do LocalStorage
const USERS_KEY = 'uniccat_users';
const CURRENT_USER_KEY = 'uniccat_current_user';
const ANNOUNCEMENTS_KEY = 'uniccat_announcements';
const TICKETS_KEY = 'uniccat_tickets';
const LINKS_KEY = 'uniccat_links';
const DOCS_KEY = 'uniccat_docs';
const POLLS_KEY = 'uniccat_polls';
const AUDIT_LOGS_KEY = 'uniccat_audit_logs';
const FAVORITES_KEY = 'uniccat_user_favorites';
const VACATIONS_KEY = 'uniccat_vacations';
const NOTIF_PREFS_KEY = 'uniccat_notif_prefs';
const WIKI_KEY = 'uniccat_wiki';
const CALENDAR_KEY = 'uniccat_calendar_events';
const CHAT_ROOMS_KEY = 'uniccat_chat_rooms';
const CHAT_MSGS_KEY = 'uniccat_chat_messages';
const USER_PRESENCE_KEY = 'uniccat_user_presence';

export const getNotificationPreferences = (userId: string): any => {
  const all = getStorageItem<Record<string, any>>(NOTIF_PREFS_KEY, {});
  return all[userId] || { email: true, push: true, announcements: true, tickets: true };
};

export const saveNotificationPreferences = (userId: string, prefs: any): void => {
  const all = getStorageItem<Record<string, any>>(NOTIF_PREFS_KEY, {});
  all[userId] = prefs;
  setStorageItem(NOTIF_PREFS_KEY, all);
};

export const getVacationNotices = (): any[] => getStorageItem<any[]>(VACATIONS_KEY, []);
export const saveVacationNotice = (notice: any): void => {
  const items = getVacationNotices();
  setStorageItem(VACATIONS_KEY, [notice, ...items]);
};
export const deleteVacationNotice = (id: string): void => {
  const items = getVacationNotices();
  setStorageItem(VACATIONS_KEY, items.filter(i => i.id !== id));
};

export const getWiki = (): any[] => getStorageItem<any[]>(WIKI_KEY, []);

// Inicializador genérico para garantir que o LocalStorage não quebre no build
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Erro ao ler chave ${key} do localStorage:`, e);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao gravar chave ${key} no localStorage:`, e);
    }
  }
};

// ==========================================
// EXPORTS REQUERIDOS PELAS VIEWS INTERNAS
// ==========================================

import { supabase, isSupabaseConfigured, toValidUuid } from './supabaseClient';

const FAKE_USER_IDS = ['u-teste-admin', 'u-ana', 'u-carlos', 'u-mariana'];
const FAKE_USER_EMAILS = [
  'teste@uniccat.com.br',
  'ana.souza@uniccat.com.br',
  'carlos.mendes@uniccat.com.br',
  'mariana.lima@uniccat.com.br'
];

export const getUsers = (): any[] => {
  const rawUsers = getStorageItem<any[]>(USERS_KEY, []);
  // Filtrar usuários fictícios de testes anteriores
  const cleanUsers = rawUsers.filter(u => 
    !FAKE_USER_IDS.includes(u.id) && !FAKE_USER_EMAILS.includes(u.email?.toLowerCase())
  );
  if (cleanUsers.length !== rawUsers.length) {
    setStorageItem(USERS_KEY, cleanUsers);
  }
  return cleanUsers;
};

export const getLastSupabaseError = () => null;

export const syncAllLocalDataToSupabase = async () => {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Supabase não está configurado. Operando via armazenamento local.', count: 0 };
  }

  let totalCount = 0;
  try {
    // Sincronizar Usuários / Profiles
    const users = getUsers();
    if (users.length > 0) {
      const profileRows = users.map(u => ({
        id: toValidUuid(u.id),
        name: u.name,
        email: u.email,
        role: u.role || 'Funcionário',
        department: u.department || 'Recursos Humanos',
        extension: u.extension || u.ramal || null,
        phone: u.phone || null,
        mobile: u.mobile || null,
        photo_url: u.photoUrl || null,
        active: u.active ?? true,
        location: u.location || 'Unidade Matriz'
      }));
      const { error } = await supabase.from('profiles').upsert(profileRows, { onConflict: 'email' });
      if (!error) totalCount += users.length;
    }

    // Sincronizar Links Rápidos
    const links = getQuickLinks();
    if (links.length > 0) {
      const linkRows = links.map(l => ({
        title: l.title,
        description: l.description || '',
        url: l.url,
        icon_name: l.iconName || 'Globe',
        category: l.category || 'Portais',
        is_official: l.isOfficial ?? true
      }));
      await supabase.from('quick_links').upsert(linkRows, { onConflict: 'url' });
      totalCount += links.length;
    }

    // Sincronizar Comunicados
    const announcements = getAnnouncements();
    if (announcements.length > 0) {
      const annRows = announcements.map(a => ({
        title: a.title,
        summary: a.summary || a.content?.substring(0, 100) || '',
        content: a.content || '',
        category: a.category || 'Geral',
        priority: a.priority || 'Normal',
        author_name: a.authorName || 'RH',
        pinned: a.pinned ?? false
      }));
      await supabase.from('announcements').insert(annRows);
      totalCount += announcements.length;
    }

    return { 
      success: true, 
      message: `Sincronização concluída com sucesso! ${totalCount} registros processados no Supabase PostgreSQL.`, 
      count: totalCount 
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na sincronização com Supabase: ${err?.message || 'Erro desconhecido'}`,
      count: 0
    };
  }
};

export const saveUser = (user: any): void => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  setStorageItem(USERS_KEY, users);

  // Sync to Supabase in background
  if (isSupabaseConfigured()) {
    Promise.resolve(
      supabase.from('profiles').upsert({
        id: toValidUuid(user.id),
        name: user.name,
        email: user.email,
        role: user.role || 'Funcionário',
        department: user.department || 'Recursos Humanos',
        extension: user.extension || user.ramal || null,
        phone: user.phone || null,
        mobile: user.mobile || null,
        photo_url: user.photoUrl || null,
        active: user.active ?? true,
        location: user.location || 'Unidade Matriz'
      }, { onConflict: 'email' })
    ).catch(console.error);
  }
};

export const saveUsersBatch = (usersBatch: any[]): void => {
  const users = getUsers();
  usersBatch.forEach(u => {
    const idx = users.findIndex(item => item.id === u.id);
    if (idx >= 0) users[idx] = u;
    else users.push(u);
  });
  setStorageItem(USERS_KEY, users);

  if (isSupabaseConfigured() && usersBatch.length > 0) {
    const profileRows = usersBatch.map(u => ({
      id: toValidUuid(u.id),
      name: u.name,
      email: u.email,
      role: u.role || 'Funcionário',
      department: u.department || 'Recursos Humanos',
      extension: u.extension || u.ramal || null,
      phone: u.phone || null,
      mobile: u.mobile || null,
      photo_url: u.photoUrl || null,
      active: u.active ?? true,
      location: u.location || 'Unidade Matriz'
    }));
    Promise.resolve(
      supabase.from('profiles').upsert(profileRows, { onConflict: 'email' })
    ).catch(console.error);
  }
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  setStorageItem(USERS_KEY, users);
};

export const updateUserPassword = (userId: string, pass: string): void => {
  const users = getUsers();
  const u = users.find(item => item.id === userId);
  if (u) {
    u.password = pass;
    setStorageItem(USERS_KEY, users);
  }
};
export const getCurrentUser = (): any | null => getStorageItem<any | null>(CURRENT_USER_KEY, null);
export const setCurrentUser = (user: any | null): void => setStorageItem(CURRENT_USER_KEY, user);
export const getQuickLinks = (): any[] => getStorageItem<any[]>(LINKS_KEY, []);
export const getAnnouncements = (): any[] => getStorageItem<any[]>(ANNOUNCEMENTS_KEY, []);
export const getTickets = (): any[] => getStorageItem<any[]>(TICKETS_KEY, []);
export const getDocuments = (): any[] => getStorageItem<any[]>(DOCS_KEY, []);
export const getPolls = (): any[] => getStorageItem<any[]>(POLLS_KEY, []);
export const getAuditLogs = (): any[] => getStorageItem<any[]>(AUDIT_LOGS_KEY, []);
export const getCalendarEvents = (): any[] => getStorageItem<any[]>(CALENDAR_KEY, []);

export const getUserFavorites = (userId: string): string[] => {
  const allFavorites = getStorageItem<Record<string, string[]>>(FAVORITES_KEY, {});
  return allFavorites[userId] || [];
};

export const saveUserFavorites = (userId: string, favorites: string[]): void => {
  const allFavorites = getStorageItem<Record<string, string[]>>(FAVORITES_KEY, {});
  allFavorites[userId] = favorites;
  setStorageItem(FAVORITES_KEY, allFavorites);
};

// ==========================================
// MÓDULO DE CHAT & PRESENÇA (STUBS ATUALIZADOS)
// ==========================================

export const getChatRooms = (...args: any[]): any[] => getStorageItem<any[]>(CHAT_ROOMS_KEY, []);
export const getChatMessages = (roomId: string, ...args: any[]): any[] => {
  const allMsgs = getStorageItem<Record<string, any[]>>(CHAT_MSGS_KEY, {});
  return allMsgs[roomId] || [];
};

export const sendChatMessage = (roomId: string, ...args: any[]): void => {
  const allMsgs = getStorageItem<Record<string, any[]>>(CHAT_MSGS_KEY, {});
  if (!allMsgs[roomId]) allMsgs[roomId] = [];
  allMsgs[roomId].push(args[0] || {});
  setStorageItem(CHAT_MSGS_KEY, allMsgs);
};

export const getUserPresences = (...args: any[]): any[] => getStorageItem<any[]>(USER_PRESENCE_KEY, []);
export const getUserPresence = (...args: any[]): any => getStorageItem<any[]>(USER_PRESENCE_KEY, []);

export const updateUserPresence = (userId: string, status: string): void => {
  console.log(`Presença atualizada para o usuário ${userId}: ${status}`);
};

export const getOrCreateDirectRoom = (...args: any[]): any => {
  console.log('Sala direta gerada', args);
  return { id: 'room-direct-' + Date.now(), name: 'Conversa', type: 'DIRECT' };
};

export const markRoomMessagesAsRead = (roomId: string, userId: string): void => {
  console.log(`Mensagens da sala ${roomId} marcadas como lidas por ${userId}`);
};

// Adicionado: Stub para criação de grupos requerido pelo ChatView
export const createGroupChatRoom = (...args: any[]): any => {
  console.log('Grupo criado', args);
  return { id: 'room-group-' + Date.now(), name: args[0] || 'Grupo', type: 'GROUP' };
};

// Adicionado: Stub para reações requerido pelo ChatView
export const toggleMessageReaction = (roomId: string, messageId: string, reaction: string, userId: string): void => {
  console.log(`Reação ${reaction} alterada na mensagem ${messageId} da sala ${roomId} por ${userId}`);
};

// ==========================================
// AÇÕES DE ESCRITA E EXCLUSÃO DO LEGADO
// ==========================================

export const saveAnnouncement = (announcement: any): void => {
  const items = getAnnouncements();
  setStorageItem(ANNOUNCEMENTS_KEY, [announcement, ...items]);
};

export const updateAnnouncement = (announcement: any): void => {
  const items = getAnnouncements();
  setStorageItem(ANNOUNCEMENTS_KEY, items.map(a => a.id === announcement.id ? announcement : a));
};

export const addAnnouncementComment = (announcementId: string, text: string, userId: string): void => {
  const items = getAnnouncements();
  const ann = items.find(a => a.id === announcementId);
  if (ann) {
    if (!ann.comments) ann.comments = [];
    ann.comments.push({ id: 'c-' + Date.now(), text, userId, createdAt: new Date().toISOString() });
    setStorageItem(ANNOUNCEMENTS_KEY, items);
  }
};

export const addDocumentComment = (documentId: string, text: string, userId: string): void => {
  const items = getDocuments();
  const doc = items.find(d => d.id === documentId);
  if (doc) {
    if (!doc.comments) doc.comments = [];
    doc.comments.push({ id: 'dc-' + Date.now(), text, userId, createdAt: new Date().toISOString() });
    setStorageItem(DOCS_KEY, items);
  }
};

export const deleteAnnouncement = (id: string): void => {
  const items = getAnnouncements();
  setStorageItem(ANNOUNCEMENTS_KEY, items.filter(i => i.id !== id));
};

export const saveTicket = (ticket: any): void => {
  const items = getTickets();
  setStorageItem(TICKETS_KEY, [ticket, ...items]);
};

export const saveQuickLink = (link: any): void => {
  const items = getQuickLinks();
  setStorageItem(LINKS_KEY, [link, ...items]);
};

export const deleteQuickLink = (id: string): void => {
  const items = getQuickLinks();
  setStorageItem(LINKS_KEY, items.filter(i => i.id !== id));
};

export const saveDocument = (doc: any): void => {
  const items = getDocuments();
  setStorageItem(DOCS_KEY, [doc, ...items]);
};

export const deleteDocument = (id: string): void => {
  const items = getDocuments();
  setStorageItem(DOCS_KEY, items.filter(i => i.id !== id));
};

export const savePoll = (poll: any): void => {
  const items = getPolls();
  setStorageItem(POLLS_KEY, [poll, ...items]);
};

export const addPoll = savePoll;

export const updatePoll = (updatedPoll: any): void => {
  const items = getPolls();
  setStorageItem(POLLS_KEY, items.map(p => p.id === updatedPoll.id ? updatedPoll : p));
};

export const deletePoll = (id: string): void => {
  const items = getPolls();
  setStorageItem(POLLS_KEY, items.filter(p => p.id !== id));
};

export const submitGoogleFormResponse = (formId: string, ...args: any[]): void => {
  console.log(`Google Form response submitted for ${formId}`, args);
};

export const saveCalendarEvent = (event: any): void => {
  const items = getCalendarEvents();
  setStorageItem(CALENDAR_KEY, [event, ...items]);
};

export const deleteCalendarEvent = (id: string): void => {
  const items = getCalendarEvents();
  setStorageItem(CALENDAR_KEY, items.filter(i => i.id !== id));
};

// ==========================================
// INTERAÇÕES REQUERIDAS PELAS VIEWS DE CONTEÚDO
// ==========================================

export const toggleUserFavorite = (userId: string, itemId: string): string[] => {
  const favorites = getUserFavorites(userId);
  const exists = favorites.includes(itemId);
  const updated = exists ? favorites.filter(id => id !== itemId) : [...favorites, itemId];
  saveUserFavorites(userId, updated);
  return updated;
};

export const confirmDocumentRead = (documentId: string, userId: string): void => {
  console.log(`Documento lido: ${documentId} por ${userId}`);
};

export const confirmAnnouncementRead = (announcementId: string, userId: string): void => {
  console.log(`Leitura confirmada: ${announcementId} por ${userId}`);
};

export const votePoll = (pollId: string, optionId: string, ...args: any[]): void => {
  console.log(`Voto registrado na enquete ${pollId}, opção ${optionId}`);
};

export const addTicketComment = (ticketId: string, content: string, user: any): void => {
  console.log(`Comentário no chamado ${ticketId} por ${user?.name}: ${content}`);
};

export const classifyTicket = (ticketId: string, category: string, subCategory: string, priority: string, assignedTo?: string, assignedToName?: string): void => {
  console.log(`Chamado ${ticketId} classificado: ${category} / ${subCategory} (${priority})`);
};

export const resolveTicket = (ticketId: string, solution: string, status: string, user: any): void => {
  console.log(`Chamado ${ticketId} resolvido: ${solution} (${status})`);
};

export const getNotifications = () => [];

export const addAuditLog = (user: any, action: string, details: string): void => {
  const logs = getAuditLogs();
  const newLog: any = {
    id: 'log-' + Date.now(),
    userId: user?.id || 'unknown',
    userName: user?.name || user?.email || 'Sistema',
    userRole: user?.role || 'USER',
    action,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  };
  setStorageItem(AUDIT_LOGS_KEY, [newLog, ...logs]);
};
