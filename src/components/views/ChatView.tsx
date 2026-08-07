import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Users, 
  Plus, 
  MessageSquare, 
  CheckCheck, 
  X, 
  Circle, 
  FileText, 
  Download, 
  MoreVertical,
  Wifi,
  Phone,
  Info,
  UserPlus,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { UserProfile, ChatRoom, ChatMessage, UserPresence, PresenceStatus } from '../../types';
import { 
  getChatRooms, 
  getChatMessages, 
  sendChatMessage, 
  createGroupChatRoom, 
  getOrCreateDirectRoom, 
  getUsers, 
  getUserPresences, 
  updateUserPresence,
  markRoomMessagesAsRead,
  toggleMessageReaction
} from '../../lib/storage';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { playNotificationChime, triggerPushNotification } from '../../lib/notifications';

interface ChatViewProps {
  currentUser: UserProfile;
  initialRoomId?: string;
  initialDirectUserId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  initialRoomId,
  initialDirectUserId
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => getChatRooms(currentUser.id));
  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    if (initialRoomId) return initialRoomId;
    const userRooms = getChatRooms(currentUser.id);
    return userRooms.length > 0 ? userRooms[0].id : '';
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  
  // Presence state
  const [presences, setPresences] = useState<Record<string, UserPresence>>(() => getUserPresences());
  const [myStatus, setMyStatus] = useState<PresenceStatus>('online');

  // Modals / Popovers
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewDirectModal, setShowNewDirectModal] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  
  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);

  // Attachment State
  const [selectedAttachment, setSelectedAttachment] = useState<{
    file: File;
    previewUrl?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allUsers = getUsers().filter(u => u.id !== currentUser.id);

  // Sync rooms and messages
  const loadRoomsAndMessages = () => {
    const userRooms = getChatRooms(currentUser.id);
    setRooms(userRooms);
    if (activeRoomId) {
      const msgs = getChatMessages(activeRoomId);
      setMessages(msgs);
      markRoomMessagesAsRead(activeRoomId, currentUser.id);
    }
  };

  // Initial setup & direct room handling
  useEffect(() => {
    if (initialDirectUserId) {
      const targetUser = getUsers().find(u => u.id === initialDirectUserId);
      if (targetUser) {
        const room = getOrCreateDirectRoom(currentUser, targetUser);
        setActiveRoomId(room.id);
      }
    }
    loadRoomsAndMessages();
  }, [currentUser.id, initialDirectUserId]);

  useEffect(() => {
    if (activeRoomId) {
      const msgs = getChatMessages(activeRoomId);
      setMessages(msgs);
      markRoomMessagesAsRead(activeRoomId, currentUser.id);
    }
  }, [activeRoomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Supabase Realtime & Local Broadcast Event Subscriptions
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      loadRoomsAndMessages();
      setPresences(getUserPresences());
    };

    const handleChatBroadcast = (e: any) => {
      const { message, room } = e.detail;
      if (message.roomId === activeRoomId) {
        setMessages(prev => [...prev, message]);
      }
      loadRoomsAndMessages();

      // Sound & Push Notification if message is from someone else
      if (message.senderId !== currentUser.id) {
        playNotificationChime();
        triggerPushNotification(`💬 ${message.senderName}`, {
          body: message.content || 'Enviou um anexo.',
        });
      }
    };

    window.addEventListener('uniccat_storage_update', handleStorageUpdate);
    window.addEventListener('uniccat_chat_msg', handleChatBroadcast);

    // Supabase Realtime Channel (if configured)
    let channel: any;
    if (isSupabaseConfigured() && supabase) {
      channel = supabase
        .channel('uniccat_chat_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.room_id === activeRoomId) {
            setMessages(prev => [...prev, {
              id: newMsg.id,
              roomId: newMsg.room_id,
              senderId: newMsg.sender_id,
              senderName: newMsg.sender_name,
              senderPhotoUrl: newMsg.sender_photo_url,
              senderRole: newMsg.sender_role,
              content: newMsg.content,
              attachmentUrl: newMsg.attachment_url,
              attachmentName: newMsg.attachment_name,
              attachmentType: newMsg.attachment_type,
              attachmentSize: newMsg.attachment_size,
              createdAt: new Date(newMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }]);
          }
          loadRoomsAndMessages();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('uniccat_storage_update', handleStorageUpdate);
      window.removeEventListener('uniccat_chat_msg', handleChatBroadcast);
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeRoomId, currentUser.id]);

  // Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;
    if (!activeRoomId) return;

    let attachUrl: string | undefined = undefined;
    let attachName: string | undefined = undefined;
    let attachType: 'image' | 'pdf' | 'doc' | 'other' | undefined = undefined;
    let attachSize: string | undefined = undefined;

    if (selectedAttachment) {
      attachName = selectedAttachment.file.name;
      attachSize = (selectedAttachment.file.size / 1024).toFixed(0) + ' KB';
      
      if (selectedAttachment.file.type.startsWith('image/')) {
        attachType = 'image';
        attachUrl = selectedAttachment.previewUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';
      } else if (selectedAttachment.file.type.includes('pdf')) {
        attachType = 'pdf';
        attachUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      } else {
        attachType = 'doc';
        attachUrl = '#';
      }
    }

    const sentMsg = sendChatMessage(
      activeRoomId,
      currentUser,
      inputText,
      attachUrl,
      attachName,
      attachType,
      attachSize
    );

    setInputText('');
    setSelectedAttachment(null);
    setMessages(prev => [...prev, sentMsg]);
    loadRoomsAndMessages();
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let previewUrl: string | undefined = undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setSelectedAttachment({ file, previewUrl });
  };

  // Handle Create Group
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedGroupMemberIds.length === 0) {
      alert('Por favor informe o nome do grupo e selecione ao menos um integrante.');
      return;
    }

    const newRoom = createGroupChatRoom(
      newGroupName,
      newGroupDesc,
      selectedGroupMemberIds,
      currentUser
    );

    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroupMemberIds([]);
    setShowNewGroupModal(false);
    setActiveRoomId(newRoom.id);
    loadRoomsAndMessages();
  };

  // Handle Start Direct Chat
  const handleStartDirect = (targetUser: UserProfile) => {
    const room = getOrCreateDirectRoom(currentUser, targetUser);
    setShowNewDirectModal(false);
    setActiveRoomId(room.id);
    loadRoomsAndMessages();
  };

  // Status Switcher
  const handleStatusChange = (status: PresenceStatus) => {
    setMyStatus(status);
    updateUserPresence(currentUser.id, status);
    setPresences(getUserPresences());
  };

  const getStatusColor = (status?: PresenceStatus) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status?: PresenceStatus) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Ausente';
      case 'busy': return 'Ocupado';
      default: return 'Offline';
    }
  };

  // Filtered Rooms
  const filteredRooms = rooms.filter(r => {
    if (filterType === 'direct' && r.type !== 'direct') return false;
    if (filterType === 'group' && r.type !== 'group') return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(query);
      return matchName;
    }
    return true;
  });

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Compute room partner for direct room
  let roomPartner: UserProfile | undefined = undefined;
  if (activeRoom && activeRoom.type === 'direct') {
    const partnerId = activeRoom.participantIds.find(id => id !== currentUser.id);
    roomPartner = getUsers().find(u => u.id === partnerId);
  }

  // Filter messages
  const displayedMessages = messages.filter(m => {
    if (!messageSearchQuery.trim()) return true;
    return m.content.toLowerCase().includes(messageSearchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR: Conversations & Status */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
        
        {/* User Presence Bar */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(myStatus)} rounded-full ring-2 ring-white dark:ring-slate-950`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
              <span className="text-[10px] text-slate-500 font-medium">Status: {getStatusLabel(myStatus)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={myStatus}
              onChange={e => handleStatusChange(e.target.value as PresenceStatus)}
              className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="online">🟢 Disponível</option>
              <option value="away">🟡 Ausente</option>
              <option value="busy">🔴 Ocupado</option>
              <option value="offline">⚪ Invisível</option>
            </select>
          </div>
        </div>

        {/* Action Header & Search */}
        <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Mensagens UNICCAT</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewDirectModal(true)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition"
                title="Nova Conversa Direta"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="p-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                title="Criar Novo Grupo"
              >
                <Plus className="w-3.5 h-3.5" /> Grupo
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 pt-1 text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 rounded-md font-semibold transition ${
                filterType === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tudo
            </button>
            <button
              onClick={() => setFilterType('direct')}
              className={`flex-1 py-1 rounded-md font-semibold transition ${
                filterType === 'direct'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Diretas
            </button>
            <button
              onClick={() => setFilterType('group')}
              className={`flex-1 py-1 rounded-md font-semibold transition ${
                filterType === 'group'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Grupos
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredRooms.map(room => {
              const isSelected = room.id === activeRoomId;
              const unread = room.unreadCounts?.[currentUser.id] || 0;

              let roomName = room.name;
              let photo = room.photoUrl;
              let statusDot: PresenceStatus | undefined = undefined;

              if (room.type === 'direct') {
                const partnerId = room.participantIds.find(id => id !== currentUser.id);
                const partner = getUsers().find(u => u.id === partnerId);
                if (partner) {
                  roomName = partner.name;
                  photo = partner.photoUrl;
                  statusDot = presences[partner.id]?.status || 'offline';
                }
              }

              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-3 cursor-pointer transition flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-950/80 border-l-4 border-blue-600' 
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {room.type === 'direct' ? (
                      <img src={photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={roomName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                    )}

                    {statusDot && (
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(statusDot)} rounded-full ring-2 ring-white dark:ring-slate-900`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                        {roomName}
                      </p>
                      {room.lastMessage && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {room.lastMessage.createdAt}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-2">
                        {room.lastMessage ? (
                          <span>
                            {room.type === 'group' && <span className="font-semibold text-slate-700 dark:text-slate-300">{room.lastMessage.senderName}: </span>}
                            {room.lastMessage.content}
                          </span>
                        ) : (
                          <span className="italic">Nenhuma mensagem</span>
                        )}
                      </p>

                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-700 text-white font-extrabold text-[10px] rounded-full shrink-0 shadow-xs">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* RIGHT WORKSPACE: Chat Feed & Input */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 min-w-0">
          
          {/* Active Room Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
            <div className="flex items-center gap-3 min-w-0">
              {activeRoom.type === 'direct' && roomPartner ? (
                <div className="relative shrink-0">
                  <img src={roomPartner.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={roomPartner.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(presences[roomPartner.id]?.status)} rounded-full ring-2 ring-white dark:ring-slate-950`} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {activeRoom.type === 'direct' && roomPartner ? roomPartner.name : activeRoom.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0">
                    <Wifi className="w-3 h-3 animate-pulse" /> Realtime Active
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {activeRoom.type === 'direct' && roomPartner 
                    ? `${roomPartner.role} • ${roomPartner.department} • Ramal ${roomPartner.extension}`
                    : activeRoom.description || `${activeRoom.participantIds.length} integrantes na sala`}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMessageSearch(!showMessageSearch)}
                className={`p-2 rounded-lg transition ${
                  showMessageSearch 
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Pesquisar nesta conversa"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Detalhes do Chat"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Message Sub-Bar */}
          {showMessageSearch && (
            <div className="p-2.5 bg-blue-50/50 dark:bg-slate-950/80 border-b border-blue-100 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={messageSearchQuery}
                onChange={e => setMessageSearchQuery(e.target.value)}
                placeholder="Filtrar mensagens nesta conversa..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-xs focus:outline-none"
              />
              {messageSearchQuery && (
                <button onClick={() => setMessageSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Message Feed Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
            {displayedMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-500" />
                Nenhuma mensagem nesta conversa ainda. Seja o primeiro a escrever!
              </div>
            ) : (
              displayedMessages.map((msg, index) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Sender Avatar */}
                    {!isMe && (
                      <img
                        src={msg.senderPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-1"
                      />
                    )}

                    {/* Bubble Container */}
                    <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      
                      {/* Sender Name header for group */}
                      {!isMe && activeRoom.type === 'group' && (
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1">
                          {msg.senderName} <span className="font-normal text-slate-400">• {msg.senderRole}</span>
                        </p>
                      )}

                      {/* Content Box */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed transition ${
                          isMe
                            ? 'bg-blue-700 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {/* Text Content */}
                        {msg.content && (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        )}

                        {/* Attachment View */}
                        {msg.attachmentUrl && (
                          <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isMe 
                              ? 'bg-blue-800/80 border-blue-600/80 text-white' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {msg.attachmentType === 'image' ? (
                                <ImageIcon className="w-5 h-5 text-amber-400 shrink-0" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-xs truncate">{msg.attachmentName}</p>
                                {msg.attachmentSize && <p className="text-[10px] opacity-75">{msg.attachmentSize}</p>}
                              </div>
                            </div>

                            <a
                              href={msg.attachmentUrl}
                              download={msg.attachmentName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        {/* Timestamp & Read Indicator */}
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          isMe ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          <span>{msg.createdAt}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                        </div>
                      </div>

                      {/* Emoji Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map((r, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() => {
                                toggleMessageReaction(activeRoomId, msg.id, r.emoji, currentUser.id);
                                setMessages(getChatMessages(activeRoomId));
                              }}
                              className={`px-2 py-0.5 rounded-full text-[11px] border font-semibold flex items-center gap-1 transition ${
                                r.userIds.includes(currentUser.id)
                                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 text-blue-800 dark:text-blue-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span>{r.userIds.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hover Emoji Reaction Quick Bar */}
                      <div className={`hidden group-hover:flex items-center gap-1 mt-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md text-xs ${
                        isMe ? 'mr-auto' : 'ml-auto'
                      }`}>
                        {['👍', '❤️', '🔥', '👏', '🎉', '✅'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              toggleMessageReaction(activeRoomId, msg.id, emoji, currentUser.id);
                              setMessages(getChatMessages(activeRoomId));
                            }}
                            className="hover:scale-125 transition transform px-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview Bar */}
          {selectedAttachment && (
            <div className="p-3 bg-blue-50 dark:bg-slate-950 border-t border-blue-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedAttachment.previewUrl ? (
                  <img src={selectedAttachment.previewUrl || undefined} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-600" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedAttachment.file.name}</p>
                  <p className="text-[10px] text-slate-500">{(selectedAttachment.file.size / 1024).toFixed(0)} KB • Anexo Pronto para Enviar</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttachment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Anexar arquivo ou imagem"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escreva sua mensagem corporativa (Pressione Enter para enviar)..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedAttachment}
              className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl transition shadow-xs flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
          <MessageSquare className="w-12 h-12 mb-3 text-blue-500 opacity-60" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Selecione uma conversa ao lado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Inicie um bate-papo direto com colaboradores da UNICCAT ou crie um grupo corporativo em tempo real.
          </p>
        </div>
      )}

      {/* NEW GROUP MODAL */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Criar Novo Grupo de Chat</span>
              </h3>
              <button onClick={() => setShowNewGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Ex: 🩺 Comissão da CIPA / Segurança"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição / Objetivo</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="Ex: Discussões técnicas de laudos e inspeções"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Selecione os Integrantes ({selectedGroupMemberIds.length})</label>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  {allUsers.map(usr => {
                    const isChecked = selectedGroupMemberIds.includes(usr.id);
                    return (
                      <div
                        key={usr.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedGroupMemberIds(prev => prev.filter(id => id !== usr.id));
                          } else {
                            setSelectedGroupMemberIds(prev => [...prev, usr.id]);
                          }
                        }}
                        className="py-2 px-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <img src={usr.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={usr.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{usr.name}</p>
                            <p className="text-[10px] text-slate-400">{usr.role} • {usr.department}</p>
                          </div>
                        </div>
                        <input type="checkbox" checked={isChecked} readOnly className="rounded text-blue-600" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Criar Grupo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW DIRECT CHAT MODAL */}
      {showNewDirectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Iniciar Conversa Direta</span>
              </h3>
              <button onClick={() => setShowNewDirectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500">Selecione um colaborador da lista de ramais UNICCAT:</p>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                {allUsers.map(usr => (
                  <div
                    key={usr.id}
                    onClick={() => handleStartDirect(usr)}
                    className="p-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <img src={usr.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={usr.name} className="w-9 h-9 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{usr.name}</p>
                      <p className="text-[10px] text-slate-500">{usr.role} • {usr.department}</p>
                      <span className="text-[10px] font-semibold text-emerald-600">Ramal: {usr.extension}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
