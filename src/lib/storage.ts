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
const CALENDAR_KEY = 'uniccat_calendar_events';
const CHAT_ROOMS_KEY = 'uniccat_chat_rooms';
const CHAT_MSGS_KEY = 'uniccat_chat_messages';
const USER_PRESENCE_KEY = 'uniccat_user_presence';

// Inicializador genérico para garantir que o LocalStorage não quebre no build
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ==========================================
// EXPORTS REQUERIDOS PELAS VIEWS INTERNAS
// ==========================================

export const getUsers = (): any[] => getStorageItem<any[]>(USERS_KEY, []);
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
// MÓDULO DE CHAT & PRESENÇA (STUBS ADICIONADOS)
// ==========================================

export const getChatRooms = (): any[] => getStorageItem<any[]>(CHAT_ROOMS_KEY, []);
export const getChatMessages = (roomId: string): any[] => {
  const allMsgs = getStorageItem<Record<string, any[]>>(CHAT_MSGS_KEY, {});
  return allMsgs[roomId] || [];
};

export const sendChatMessage = (roomId: string, message: any): void => {
  const allMsgs = getStorageItem<Record<string, any[]>>(CHAT_MSGS_KEY, {});
  if (!allMsgs[roomId]) allMsgs[roomId] = [];
  allMsgs[roomId].push(message);
  setStorageItem(CHAT_MSGS_KEY, allMsgs);
};

export const getUserPresence = (): any[] => getStorageItem<any[]>(USER_PRESENCE_KEY, []);
export const updateUserPresence = (userId: string, status: string): void => {
  console.log(`Presença atualizada para o usuário ${userId}: ${status}`);
};

// ==========================================
// AÇÕES DE ESCRITA E EXCLUSÃO DO LEGADO
// ==========================================

export const saveAnnouncement = (announcement: any): void => {
  const items = getAnnouncements();
  setStorageItem(ANNOUNCEMENTS_KEY, [announcement, ...items]);
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

export const votePoll = (pollId: string, optionId: string, userId: string): void => {
  console.log(`Voto registrado na enquete ${pollId}, opção ${optionId} por ${userId}`);
};

export const addTicketMessage = (ticketId: string, message: any): void => {
  console.log(`Mensagem no chamado ${ticketId}`, message);
};

export const updateTicketStatus = (ticketId: string, status: string): void => {
  console.log(`Status do chamado ${ticketId} alterado para ${status}`);
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




