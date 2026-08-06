import {
  UserProfile,
  Announcement,
  QuickLink,
  DocumentFile,
  CalendarEvent,
  HelpdeskTicket,
  RoomBooking,
  AuditLog,
  Poll,
  WikiArticle,
  NotificationItem
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_QUICK_LINKS,
  INITIAL_DOCUMENTS,
  INITIAL_EVENTS,
  INITIAL_TICKETS,
  INITIAL_BOOKINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_POLLS,
  INITIAL_WIKI,
  INITIAL_NOTIFICATIONS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'uniccat_intranet_users_v1',
  CURRENT_USER: 'uniccat_intranet_current_user_v1',
  ANNOUNCEMENTS: 'uniccat_intranet_announcements_v1',
  QUICK_LINKS: 'uniccat_intranet_quick_links_v1',
  DOCUMENTS: 'uniccat_intranet_documents_v1',
  EVENTS: 'uniccat_intranet_events_v1',
  TICKETS: 'uniccat_intranet_tickets_v1',
  BOOKINGS: 'uniccat_intranet_bookings_v1',
  AUDIT_LOGS: 'uniccat_intranet_audit_logs_v1',
  POLLS: 'uniccat_intranet_polls_v1',
  WIKI: 'uniccat_intranet_wiki_v1',
  NOTIFICATIONS: 'uniccat_intranet_notifications_v1',
  USER_FAVORITES: 'uniccat_intranet_favorites_v1',
  THEME: 'uniccat_intranet_theme_v1',
  CHAT_ROOMS: 'uniccat_intranet_chat_rooms_v1',
  CHAT_MESSAGES: 'uniccat_intranet_chat_messages_v1',
  USER_PRESENCE: 'uniccat_intranet_user_presence_v1',
  NOTIFICATION_PREFERENCES: 'uniccat_intranet_notif_prefs_v1'
};

const dispatchChange = (key: string) => {
  window.dispatchEvent(new CustomEvent('uniccat_storage_update', { detail: { key } }));
};

// Generic Helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    dispatchChange(key);
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// User & Auth Storage
export const getUsers = (): UserProfile[] => getStored(STORAGE_KEYS.USERS, INITIAL_USERS);

export const saveUser = (user: UserProfile): void => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  
  // Ensure default password if not set
  const userToSave = {
    ...user,
    password: user.password || (idx >= 0 && users[idx].password) || 'senha123'
  };

  if (idx >= 0) {
    users[idx] = userToSave;
  } else {
    users.push(userToSave);
  }
  setStored(STORAGE_KEYS.USERS, users);

  // If saving current logged in user, sync current_user storage as well
  const current = getCurrentUser();
  if (current && current.id === user.id) {
    setStored(STORAGE_KEYS.CURRENT_USER, userToSave);
  }
};

export const updateUserPassword = (userId: string, newPassword: string): void => {
  const users = getUsers();
  const item = users.find(u => u.id === userId);
  if (item) {
    item.password = newPassword;
    setStored(STORAGE_KEYS.USERS, users);

    const current = getCurrentUser();
    if (current && current.id === userId) {
      current.password = newPassword;
      setStored(STORAGE_KEYS.CURRENT_USER, current);
    }
  }
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  setStored(STORAGE_KEYS.USERS, users);
};

export const getCurrentUser = (): UserProfile | null => {
  return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
};

export const setCurrentUser = (user: UserProfile | null): void => {
  setStored(STORAGE_KEYS.CURRENT_USER, user);
};

// Announcements Storage
export const getAnnouncements = (): Announcement[] => getStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);

export const saveAnnouncement = (announcement: Announcement): void => {
  const items = getAnnouncements();
  const idx = items.findIndex(a => a.id === announcement.id);
  if (idx >= 0) {
    items[idx] = announcement;
  } else {
    items.unshift(announcement);
  }
  setStored(STORAGE_KEYS.ANNOUNCEMENTS, items);
};

export const deleteAnnouncement = (id: string): void => {
  const items = getAnnouncements().filter(a => a.id !== id);
  setStored(STORAGE_KEYS.ANNOUNCEMENTS, items);
};

export const confirmAnnouncementRead = (announcementId: string, userId: string): void => {
  const items = getAnnouncements();
  const item = items.find(a => a.id === announcementId);
  if (item) {
    if (!item.readBy) item.readBy = [];
    if (!item.readBy.includes(userId)) {
      item.readBy.push(userId);
      setStored(STORAGE_KEYS.ANNOUNCEMENTS, items);
    }
  }
};

export const addAnnouncementComment = (announcementId: string, commentContent: string, user: UserProfile): void => {
  const items = getAnnouncements();
  const item = items.find(a => a.id === announcementId);
  if (item) {
    if (!item.comments) item.comments = [];
    item.comments.push({
      id: 'cm-' + Date.now(),
      announcementId,
      userId: user.id,
      userName: user.name,
      userPhotoUrl: user.photoUrl,
      content: commentContent,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, items);
  }
};

// Quick Links
export const getQuickLinks = (): QuickLink[] => getStored(STORAGE_KEYS.QUICK_LINKS, INITIAL_QUICK_LINKS);

export const saveQuickLink = (link: QuickLink): void => {
  const items = getQuickLinks();
  const idx = items.findIndex(l => l.id === link.id);
  if (idx >= 0) {
    items[idx] = link;
  } else {
    items.push(link);
  }
  setStored(STORAGE_KEYS.QUICK_LINKS, items);
};

export const deleteQuickLink = (id: string): void => {
  const items = getQuickLinks().filter(l => l.id !== id);
  setStored(STORAGE_KEYS.QUICK_LINKS, items);
};

// Favorites
export const getUserFavorites = (userId: string): string[] => {
  const allFavs = getStored<Record<string, string[]>>(STORAGE_KEYS.USER_FAVORITES, {});
  return allFavs[userId] || ['ql-1', 'ql-2', 'ql-3', 'ql-4'];
};

export const toggleUserFavorite = (userId: string, linkId: string): void => {
  const allFavs = getStored<Record<string, string[]>>(STORAGE_KEYS.USER_FAVORITES, {});
  const current = allFavs[userId] || ['ql-1', 'ql-2', 'ql-3', 'ql-4'];
  if (current.includes(linkId)) {
    allFavs[userId] = current.filter(id => id !== linkId);
  } else {
    allFavs[userId] = [...current, linkId];
  }
  setStored(STORAGE_KEYS.USER_FAVORITES, allFavs);
};

// Documents
export const getDocuments = (): DocumentFile[] => getStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);

export const saveDocument = (doc: DocumentFile): void => {
  const items = getDocuments();
  const idx = items.findIndex(d => d.id === doc.id);
  if (idx >= 0) {
    items[idx] = doc;
  } else {
    items.unshift(doc);
  }
  setStored(STORAGE_KEYS.DOCUMENTS, items);
};

export const deleteDocument = (id: string): void => {
  const items = getDocuments().filter(d => d.id !== id);
  setStored(STORAGE_KEYS.DOCUMENTS, items);
};

export const confirmDocumentRead = (docId: string, userId: string): void => {
  const items = getDocuments();
  const item = items.find(d => d.id === docId);
  if (item) {
    if (!item.confirmedReaders) item.confirmedReaders = [];
    if (!item.confirmedReaders.includes(userId)) {
      item.confirmedReaders.push(userId);
      setStored(STORAGE_KEYS.DOCUMENTS, items);
    }
  }
};

// Events
export const getCalendarEvents = (): CalendarEvent[] => getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);

export const saveCalendarEvent = (evt: CalendarEvent): void => {
  const items = getCalendarEvents();
  const idx = items.findIndex(e => e.id === evt.id);
  if (idx >= 0) {
    items[idx] = evt;
  } else {
    items.push(evt);
  }
  setStored(STORAGE_KEYS.EVENTS, items);
};

export const deleteCalendarEvent = (id: string): void => {
  const items = getCalendarEvents().filter(e => e.id !== id);
  setStored(STORAGE_KEYS.EVENTS, items);
};

// Tickets
export const getTickets = (): HelpdeskTicket[] => getStored(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);

export const saveTicket = (ticket: HelpdeskTicket): void => {
  const items = getTickets();
  const idx = items.findIndex(t => t.id === ticket.id);
  if (idx >= 0) {
    items[idx] = ticket;
  } else {
    items.unshift(ticket);
  }
  setStored(STORAGE_KEYS.TICKETS, items);
};

export const addTicketComment = (ticketId: string, content: string, user: UserProfile): void => {
  const items = getTickets();
  const item = items.find(t => t.id === ticketId);
  if (item) {
    item.comments.push({
      id: 'tc-' + Date.now(),
      ticketId,
      userId: user.id,
      userName: user.name,
      userPhotoUrl: user.photoUrl,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    item.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setStored(STORAGE_KEYS.TICKETS, items);
  }
};

export const classifyTicket = (
  ticketId: string,
  category: string,
  subCategory: string,
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica',
  assignedTo?: string,
  assignedToName?: string
): void => {
  const items = getTickets();
  const item = items.find(t => t.id === ticketId);
  if (item) {
    item.category = category;
    item.subCategory = subCategory;
    item.priority = priority;
    if (assignedTo) item.assignedTo = assignedTo;
    if (assignedToName) item.assignedToName = assignedToName;
    if (item.status === 'Aberto') item.status = 'Em Andamento';
    item.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setStored(STORAGE_KEYS.TICKETS, items);
  }
};

export const resolveTicket = (
  ticketId: string,
  solution: string,
  status: 'Resolvido' | 'Em Andamento' | 'Pendente' | 'Cancelado',
  user: UserProfile
): void => {
  const items = getTickets();
  const item = items.find(t => t.id === ticketId);
  if (item) {
    item.solution = solution;
    item.status = status;
    item.solutionDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    item.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // Add system comment on resolution
    item.comments.push({
      id: 'tc-' + Date.now(),
      ticketId,
      userId: user.id,
      userName: user.name,
      userPhotoUrl: user.photoUrl,
      content: `[SOLUÇÃO GLPI DE TI]: ${solution}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setStored(STORAGE_KEYS.TICKETS, items);
  }
};

// Bookings
export const getBookings = (): RoomBooking[] => getStored(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);

export const saveBooking = (booking: RoomBooking): void => {
  const items = getBookings();
  items.unshift(booking);
  setStored(STORAGE_KEYS.BOOKINGS, items);
};

export const cancelBooking = (id: string): void => {
  const items = getBookings();
  const item = items.find(b => b.id === id);
  if (item) {
    item.status = 'Cancelado';
    setStored(STORAGE_KEYS.BOOKINGS, items);
  }
};

// Polls
export const getPolls = (): Poll[] => getStored(STORAGE_KEYS.POLLS, INITIAL_POLLS);

export const votePoll = (pollId: string, optionId: string, userId: string): void => {
  const items = getPolls();
  const poll = items.find(p => p.id === pollId);
  if (poll && !poll.votedUserIds.includes(userId)) {
    poll.votedUserIds.push(userId);
    const opt = poll.options.find(o => o.id === optionId);
    if (opt) {
      opt.votes += 1;
    }
    setStored(STORAGE_KEYS.POLLS, items);
  }
};

// Wiki
export const getWiki = (): WikiArticle[] => getStored(STORAGE_KEYS.WIKI, INITIAL_WIKI);

// Notifications
export const getNotifications = (): NotificationItem[] => getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

export const markNotificationRead = (id: string): void => {
  const items = getNotifications();
  const item = items.find(n => n.id === id);
  if (item) {
    item.read = true;
    setStored(STORAGE_KEYS.NOTIFICATIONS, items);
  }
};

export const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void => {
  const items = getNotifications();
  items.unshift({
    ...notif,
    id: 'notif-' + Date.now(),
    read: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });
  setStored(STORAGE_KEYS.NOTIFICATIONS, items);
};

// Audit Logs
export const getAuditLogs = (): AuditLog[] => getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);

export const addAuditLog = (user: UserProfile, action: AuditLog['action'], details: string): void => {
  const logs = getAuditLogs();
  logs.unshift({
    id: 'aud-' + Date.now(),
    userId: user.id,
    userName: user.name,
    action,
    details,
    ipAddress: '192.168.0.' + Math.floor(Math.random() * 200 + 10),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
  setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
};

// ==========================================
// CHAT & REALTIME INSTANT MESSAGING MODULE
// ==========================================

import { ChatRoom, ChatMessage, UserPresence, PresenceStatus, NotificationPreferences } from '../types';

const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-general',
    type: 'group',
    name: '💬 Canal Geral UNICCAT',
    description: 'Bate-papo corporativo geral da equipe UNICCAT Medicina e Segurança',
    photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    participantIds: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5'],
    createdBy: 'u-1',
    createdAt: '2026-08-01 08:00',
    lastMessage: {
      content: 'Bem-vindos ao chat corporativo em tempo real da UNICCAT!',
      senderName: 'Dr. Roberto Mendes',
      createdAt: '10:30'
    },
    unreadCounts: {}
  },
  {
    id: 'room-medicina-ti',
    type: 'group',
    name: '🩺 Medicina Ocupacional & Suporte T.I.',
    description: 'Canal rápido de dúvidas sobre laudos, prontuários e chamados',
    photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    participantIds: ['u-1', 'u-2', 'u-3'],
    createdBy: 'u-2',
    createdAt: '2026-08-02 09:15',
    lastMessage: {
      content: 'O novo lote de exames audiométricos foi processado no Infomed.',
      senderName: 'Dra. Camila Silveira',
      createdAt: '11:10'
    },
    unreadCounts: {}
  },
  {
    id: 'room-direct-u1-u2',
    type: 'direct',
    name: 'Dra. Camila Silveira',
    participantIds: ['u-1', 'u-2'],
    createdBy: 'u-1',
    createdAt: '2026-08-03 14:00',
    lastMessage: {
      content: 'Olá Dr. Roberto, o relatório de absenteísmo mensal está pronto.',
      senderName: 'Dra. Camila Silveira',
      createdAt: '11:45'
    },
    unreadCounts: {}
  }
];

const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'room-general': [
    {
      id: 'msg-g1',
      roomId: 'room-general',
      senderId: 'u-1',
      senderName: 'Dr. Roberto Mendes',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Diretor Médico',
      content: 'Bem-vindos ao novo canal de mensagens instantâneas e colaboração interna da UNICCAT! 🚀',
      createdAt: '09:00',
      reactions: [{ emoji: '👏', userIds: ['u-2', 'u-3', 'u-4'] }]
    },
    {
      id: 'msg-g2',
      roomId: 'room-general',
      senderId: 'u-3',
      senderName: 'Carlos Silva',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Analista de T.I.',
      content: 'Excelente! O sistema é integrado via Supabase Realtime, garantindo atualizações sem delay.',
      createdAt: '09:15',
      reactions: [{ emoji: '🔥', userIds: ['u-1', 'u-2'] }]
    },
    {
      id: 'msg-g3',
      roomId: 'room-general',
      senderId: 'u-2',
      senderName: 'Dra. Camila Silveira',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Coordenadora de Medicina Ocupacional',
      content: 'Muito prático! Posso enviar anexos de laudos ou procedimentos por aqui também?',
      createdAt: '10:15'
    },
    {
      id: 'msg-g4',
      roomId: 'room-general',
      senderId: 'u-3',
      senderName: 'Carlos Silva',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Analista de T.I.',
      content: 'Sim! Comporta arquivos em PDF, imagens e documentos com pré-visualização direta.',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachmentName: 'Manual_Boas_Praticas_Chat_UNICCAT.pdf',
      attachmentType: 'pdf',
      attachmentSize: '420 KB',
      createdAt: '10:20',
      reactions: [{ emoji: '👍', userIds: ['u-1'] }]
    }
  ],
  'room-medicina-ti': [
    {
      id: 'msg-m1',
      roomId: 'room-medicina-ti',
      senderId: 'u-2',
      senderName: 'Dra. Camila Silveira',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Coordenadora de Medicina Ocupacional',
      content: 'O novo lote de exames audiométricos foi processado no Infomed.',
      createdAt: '11:10',
      reactions: [{ emoji: '✅', userIds: ['u-3'] }]
    }
  ],
  'room-direct-u1-u2': [
    {
      id: 'msg-d1',
      roomId: 'room-direct-u1-u2',
      senderId: 'u-2',
      senderName: 'Dra. Camila Silveira',
      senderPhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Coordenadora de Medicina Ocupacional',
      content: 'Olá Dr. Roberto, o relatório de absenteísmo mensal está pronto para sua validação.',
      createdAt: '11:45'
    }
  ]
};

const DEFAULT_NOTIF_PREFS: NotificationPreferences = {
  enableBrowserPush: true,
  enableSound: true,
  enableInAppToast: true,
  categoryAnnouncements: true,
  categoryBirthdays: true,
  categoryChat: true,
  categoryTickets: true,
  categoryCalendar: true,
  categoryCritical: true
};

export const getChatRooms = (userId: string): ChatRoom[] => {
  const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
  return rooms.filter(r => r.participantIds.includes(userId));
};

export const getAllChatRooms = (): ChatRoom[] => {
  return getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
};

export const getChatMessages = (roomId: string): ChatMessage[] => {
  const allMsgs = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  return allMsgs[roomId] || [];
};

export const sendChatMessage = (
  roomId: string,
  sender: UserProfile,
  content: string,
  attachmentUrl?: string,
  attachmentName?: string,
  attachmentType?: 'image' | 'pdf' | 'doc' | 'other',
  attachmentSize?: string
): ChatMessage => {
  const allMsgs = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    roomId,
    senderId: sender.id,
    senderName: sender.name,
    senderPhotoUrl: sender.photoUrl,
    senderRole: sender.role,
    content,
    attachmentUrl,
    attachmentName,
    attachmentType,
    attachmentSize,
    createdAt: nowTime
  };

  if (!allMsgs[roomId]) {
    allMsgs[roomId] = [];
  }
  allMsgs[roomId].push(newMsg);
  setStored(STORAGE_KEYS.CHAT_MESSAGES, allMsgs);

  // Update room lastMessage and unread counts for other participants
  const rooms = getAllChatRooms();
  const room = rooms.find(r => r.id === roomId);
  if (room) {
    room.lastMessage = {
      content: attachmentName ? `📎 [Arquivo] ${attachmentName}` : content,
      senderName: sender.name,
      createdAt: nowTime
    };

    if (!room.unreadCounts) room.unreadCounts = {};
    room.participantIds.forEach(pId => {
      if (pId !== sender.id) {
        room.unreadCounts![pId] = (room.unreadCounts![pId] || 0) + 1;
      }
    });

    setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
  }

  // Dispatch custom chat broadcast event
  window.dispatchEvent(new CustomEvent('uniccat_chat_msg', { 
    detail: { message: newMsg, room } 
  }));

  return newMsg;
};

export const createGroupChatRoom = (
  name: string,
  description: string,
  participantIds: string[],
  creator: UserProfile
): ChatRoom => {
  const rooms = getAllChatRooms();
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const allParticipants = Array.from(new Set([creator.id, ...participantIds]));

  const newRoom: ChatRoom = {
    id: 'room-group-' + Date.now(),
    type: 'group',
    name,
    description,
    photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    participantIds: allParticipants,
    createdBy: creator.id,
    createdAt: dateStr,
    lastMessage: {
      content: `Grupo "${name}" criado por ${creator.name}`,
      senderName: 'Sistema',
      createdAt: timeStr
    },
    unreadCounts: {}
  };

  rooms.unshift(newRoom);
  setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);

  // Add initial system message
  sendChatMessage(newRoom.id, creator, `Grupo "${name}" criado com sucesso.`);

  return newRoom;
};

export const getOrCreateDirectRoom = (user1: UserProfile, user2: UserProfile): ChatRoom => {
  const rooms = getAllChatRooms();
  let directRoom = rooms.find(
    r => r.type === 'direct' && r.participantIds.includes(user1.id) && r.participantIds.includes(user2.id)
  );

  if (!directRoom) {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    directRoom = {
      id: `room-direct-${user1.id}-${user2.id}`,
      type: 'direct',
      name: user2.name,
      photoUrl: user2.photoUrl,
      participantIds: [user1.id, user2.id],
      createdBy: user1.id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastMessage: {
        content: 'Conversa iniciada',
        senderName: 'Sistema',
        createdAt: timeStr
      },
      unreadCounts: {}
    };
    rooms.unshift(directRoom);
    setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
  }

  return directRoom;
};

export const markRoomMessagesAsRead = (roomId: string, userId: string): void => {
  const rooms = getAllChatRooms();
  const room = rooms.find(r => r.id === roomId);
  if (room && room.unreadCounts && room.unreadCounts[userId]) {
    room.unreadCounts[userId] = 0;
    setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
  }
};

export const toggleMessageReaction = (roomId: string, messageId: string, emoji: string, userId: string): void => {
  const allMsgs = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  const msgs = allMsgs[roomId];
  if (!msgs) return;

  const msg = msgs.find(m => m.id === messageId);
  if (!msg) return;

  if (!msg.reactions) msg.reactions = [];

  const existingReaction = msg.reactions.find(r => r.emoji === emoji);
  if (existingReaction) {
    if (existingReaction.userIds.includes(userId)) {
      existingReaction.userIds = existingReaction.userIds.filter(id => id !== userId);
      if (existingReaction.userIds.length === 0) {
        msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
      }
    } else {
      existingReaction.userIds.push(userId);
    }
  } else {
    msg.reactions.push({ emoji, userIds: [userId] });
  }

  setStored(STORAGE_KEYS.CHAT_MESSAGES, allMsgs);
};

// USER PRESENCE REALTIME ENGINE
const INITIAL_PRESENCES: Record<string, UserPresence> = {
  'u-1': { userId: 'u-1', status: 'online', lastSeen: 'Agora', customStatus: 'Disponível na UNICCAT' },
  'u-2': { userId: 'u-2', status: 'online', lastSeen: 'Agora', customStatus: 'Em consultas ocupacionais' },
  'u-3': { userId: 'u-3', status: 'online', lastSeen: 'Agora', customStatus: 'Atendendo suporte TI' },
  'u-4': { userId: 'u-4', status: 'away', lastSeen: 'Há 15 min', customStatus: 'Em reunião com clientes' },
  'u-5': { userId: 'u-5', status: 'offline', lastSeen: 'Há 1 hora', customStatus: 'Pausa para almoço' }
};

export const getUserPresences = (): Record<string, UserPresence> => {
  return getStored<Record<string, UserPresence>>(STORAGE_KEYS.USER_PRESENCE, INITIAL_PRESENCES);
};

export const updateUserPresence = (userId: string, status: PresenceStatus, customStatus?: string): void => {
  const presences = getUserPresences();
  presences[userId] = {
    userId,
    status,
    lastSeen: 'Agora',
    customStatus: customStatus ?? presences[userId]?.customStatus
  };
  setStored(STORAGE_KEYS.USER_PRESENCE, presences);
};

// NOTIFICATION PREFERENCES
export const getNotificationPreferences = (userId: string): NotificationPreferences => {
  const allPrefs = getStored<Record<string, NotificationPreferences>>(STORAGE_KEYS.NOTIFICATION_PREFERENCES, {});
  return allPrefs[userId] || DEFAULT_NOTIF_PREFS;
};

export const saveNotificationPreferences = (userId: string, prefs: NotificationPreferences): void => {
  const allPrefs = getStored<Record<string, NotificationPreferences>>(STORAGE_KEYS.NOTIFICATION_PREFERENCES, {});
  allPrefs[userId] = prefs;
  setStored(STORAGE_KEYS.NOTIFICATION_PREFERENCES, allPrefs);
};

