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
// INTERAÇÕES REQUERIDAS PELO DASHBOARD
// ==========================================

export const toggleUserFavorite = (userId: string, itemId: string): string[] => {
  const favorites = getUserFavorites(userId);
  const exists = favorites.includes(itemId);
  const updated = exists ? favorites.filter(id => id !== itemId) : [...favorites, itemId];
  saveUserFavorites(userId, updated);
  return updated;
};

export const confirmAnnouncementRead = (announcementId: string, userId: string): void => {
  console.log(`Leitura confirmada: ${announcementId} por ${userId}`);
};

export const votePoll = (pollId: string, optionId: string, userId: string): void => {
  console.log(`Voto registrado na enquete ${pollId}, opção ${optionId} por ${userId}`);
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

