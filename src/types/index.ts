export type Role =
  | 'Administrador'
  | 'RH'
  | 'Financeiro'
  | 'Comercial'
  | 'Recepção'
  | 'Médico'
  | 'Coordenador'
  | 'Gestor'
  | 'Funcionário';

export type Department =
  | 'Diretoria'
  | 'Medicina Ocupacional'
  | 'Segurança do Trabalho'
  | 'Recursos Humanos'
  | 'Financeiro & Administrativo'
  | 'Comercial'
  | 'Recepção & Atendimento'
  | 'Tecnologia da Informação'
  | 'Qualidade & Processos';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: Department;
  phone: string;
  extension: string; // Ramal
  mobile: string;
  photoUrl: string;
  active: boolean;
  birthDate?: string;
  hireDate?: string;
  bio?: string;
  location?: string;
  password?: string;
  lastLogin?: string;
  createdAt: string;
}

export type AnnouncementCategory =
  | 'Comunicados'
  | 'Avisos'
  | 'Eventos'
  | 'Aniversariantes'
  | 'Novos Colaboradores'
  | 'Campanhas'
  | 'Benefícios'
  | 'Feriados'
  | 'Treinamentos'
  | 'Comunicados Urgentes';

export type AnnouncementPriority = 'Urgente' | 'Alta' | 'Normal';

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userPhotoUrl: string;
  content: string;
  createdAt: string;
}

export interface AnnouncementAttachment {
  name: string;
  type: 'image' | 'video' | 'pdf' | 'link' | 'doc';
  url: string;
  size?: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  pinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorPhotoUrl: string;
  coverImage?: string;
  attachments?: AnnouncementAttachment[];
  publishDate: string;
  expirationDate?: string;
  allowComments: boolean;
  requiresReadConfirmation: boolean;
  readBy: string[]; // user IDs who confirmed reading
  comments?: AnnouncementComment[];
  targetDepartments?: Department[];
  createdAt: string;
}

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  iconName: string;
  category: 'Sistemas Internos' | 'Portais' | 'Ferramentas' | 'RH' | 'Externo';
  isOfficial: boolean;
  order: number;
  openInNewTab: boolean;
  badge?: string;
  favoritesCount?: number;
}

export type DocumentCategory =
  | 'RH'
  | 'Financeiro'
  | 'Comercial'
  | 'Jurídico'
  | 'Qualidade'
  | 'Documentos Internos'
  | 'Formulários'
  | 'POP'
  | 'Manuais'
  | 'Treinamentos';

export type FileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'video' | 'zip' | 'other';

export interface DocumentFile {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  fileType: FileType;
  fileSize: string;
  downloadUrl: string;
  authorName: string;
  department: Department;
  version: string;
  downloadsCount: number;
  mandatoryReading: boolean;
  confirmedReaders?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: 'Feriado' | 'Treinamento' | 'Evento' | 'Reunião' | 'Campanha' | 'Aniversário';
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  location?: string;
  department?: Department;
  organizer: string;
  isAllDay: boolean;
}

export interface Birthday {
  id: string;
  name: string;
  photoUrl: string;
  department: Department;
  role: string;
  birthDate: string; // MM-DD
  day: number;
  month: number;
  age?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'document' | 'event' | 'ticket' | 'birthday' | 'system' | 'chat';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  customStatus?: string;
}

export interface ChatMessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'doc' | 'other';
  attachmentSize?: string;
  createdAt: string;
  reactions?: ChatMessageReaction[];
  isSystemMsg?: boolean;
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name: string;
  description?: string;
  photoUrl?: string;
  participantIds: string[];
  createdBy: string;
  createdAt: string;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  unreadCounts?: Record<string, number>; // userId -> unread count
}

export interface NotificationPreferences {
  enableBrowserPush: boolean;
  enableSound: boolean;
  enableInAppToast: boolean;
  categoryAnnouncements: boolean;
  categoryBirthdays: boolean;
  categoryChat: boolean;
  categoryTickets: boolean;
  categoryCalendar: boolean;
  categoryCritical: boolean;
}


export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userPhotoUrl: string;
  content: string;
  createdAt: string;
}

export interface HelpdeskTicket {
  id: string;
  code: string; // e.g. UNIC-1024
  title: string;
  description: string;
  category: string; // e.g. 'TI' or specific T.I. module like 'Infomed', 'Hardware', 'Rede'
  subCategory?: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status: 'Aberto' | 'Em Andamento' | 'Pendente' | 'Resolvido' | 'Cancelado';
  requesterId: string;
  requesterName: string;
  requesterDepartment: Department;
  requesterExtension?: string;
  assignedTo?: string;
  assignedToName?: string;
  solution?: string;
  solutionDate?: string;
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomBooking {
  id: string;
  resourceName: string;
  type: 'Sala de Reunião' | 'Veículo Corporativo' | 'Auditório' | 'Projetor';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reservedBy: string;
  userDepartment: Department;
  purpose: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'CRIAR_COMUNICADO' | 'UPLOAD_ARQUIVO' | 'EDITAR_PERMISSAO' | 'EXCLUIR_REGISTRO' | 'ALTERAR_SENHA' | 'DOWNLOAD_DOC';
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  votedUserIds: string[];
  active: boolean;
  endDate: string;
  category: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  views: number;
  tags: string[];
}
