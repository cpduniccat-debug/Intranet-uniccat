import { UserProfile, Announcement, Ticket, QuickLink, DocumentFile, Poll, AuditLog } from '../types';

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

export const getUsers = (): UserProfile[] => {
  return getStorageItem<UserProfile[]>(USERS_KEY, []);
};

export const getCurrentUser = (): UserProfile | null => {
  return getStorageItem<UserProfile | null>(CURRENT_USER_KEY, null);
};

export const setCurrentUser = (user: UserProfile | null): void => {
  setStorageItem(CURRENT_USER_KEY, user);
};

export const getQuickLinks = (): QuickLink[] => {
  return getStorageItem<QuickLink[]>(LINKS_KEY, []);
};

export const getAnnouncements = (): Announcement[] => {
  return getStorageItem<Announcement[]>(ANNOUNCEMENTS_KEY, []);
};

export const getTickets = (): Ticket[] => {
  return getStorageItem<Ticket[]>(TICKETS_KEY, []);
};

export const getDocuments = (): DocumentFile[] => {
  return getStorageItem<DocumentFile[]>(DOCS_KEY, []);
};

export const getPolls = (): Poll[] => {
  return getStorageItem<Poll[]>(POLLS_KEY, []);
};

export const getAuditLogs = (): AuditLog[] => {
  return getStorageItem<AuditLog[]>(AUDIT_LOGS_KEY, []);
};

export const getUserFavorites = (userId: string): string[] => {
  const allFavorites = getStorageItem<Record<string, string[]>>(FAVORITES_KEY, {});
  return allFavorites[userId] || [];
};

export const saveUserFavorites = (userId: string, favorites: string[]): void => {
  const allFavorites = getStorageItem<Record<string, string[]>>(FAVORITES_KEY, {});
  allFavorites[userId] = favorites;
  setStorageItem(FAVORITES_KEY, allFavorites);
};

export const getNotifications = () => [];

export const addAuditLog = (user: any, action: string, details: string): void => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
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
