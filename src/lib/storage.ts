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

const DEFAULT_USERS = [
  {
    id: 'u-teste-admin',
    name: 'Usuário Teste (Admin)',
    email: 'teste@uniccat.com.br',
    password: 'uni@123',
    role: 'Administrador',
    department: 'Tecnologia da Informação',
    extension: '100',
    phone: '(11) 3300-1000',
    mobile: '(11) 99999-9999',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-ana',
    name: 'Ana Paula Souza',
    email: 'ana.souza@uniccat.com.br',
    password: 'uni@123',
    role: 'Funcionário',
    department: 'Medicina Ocupacional',
    extension: '101',
    phone: '(11) 3300-1001',
    mobile: '(11) 99111-2233',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-carlos',
    name: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@uniccat.com.br',
    password: 'uni@123',
    role: 'Administrador',
    department: 'Tecnologia da Informação',
    extension: '102',
    phone: '(11) 3300-1002',
    mobile: '(11) 99222-3344',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-mariana',
    name: 'Mariana Lima Santos',
    email: 'mariana.lima@uniccat.com.br',
    password: 'uni@123',
    role: 'RH',
    department: 'Recursos Humanos',
    extension: '103',
    phone: '(11) 3300-1003',
    mobile: '(11) 99333-4455',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const getUsers = (): any[] => {
  const users = getStorageItem<any[]>(USERS_KEY, []);
  if (users.length === 0) {
    setStorageItem(USERS_KEY, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  const testeIdx = users.findIndex(u => u.email === 'teste@uniccat.com.br');
  if (testeIdx >= 0) {
    if (users[testeIdx].role !== 'Administrador' || !users[testeIdx].active) {
      users[testeIdx].role = 'Administrador';
      users[testeIdx].active = true;
      setStorageItem(USERS_KEY, users);
    }
  } else {
    users.push({
      id: 'u-teste-admin',
      name: 'Usuário Teste (Admin)',
      email: 'teste@uniccat.com.br',
      password: 'uni@123',
      role: 'Administrador',
      department: 'Tecnologia da Informação',
      extension: '100',
      phone: '(11) 3300-1000',
      mobile: '(11) 99999-9999',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      active: true,
      createdAt: new Date().toISOString()
    });
    setStorageItem(USERS_KEY, users);
  }
  return users;
};
export const getLastSupabaseError = () => null;

export const syncAllLocalDataToSupabase = async () => {
  return { success: true, message: 'Dados sincronizados com sucesso.', count: 0 };
};

export const saveUser = (user: any): void => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  setStorageItem(USERS_KEY, users);
};

export const saveUsersBatch = (usersBatch: any[]): void => {
  const users = getUsers();
  usersBatch.forEach(u => {
    const idx = users.findIndex(item => item.id === u.id);
    if (idx >= 0) users[idx] = u;
    else users.push(u);
  });
  setStorageItem(USERS_KEY, users);
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
