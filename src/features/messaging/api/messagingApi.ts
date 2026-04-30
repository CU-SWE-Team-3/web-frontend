import apiClient from '@/shared/api/client';
import type {
  Conversation,
  Message,
  MessageUser,
  PaginatedResponse,
  ConversationsData,
  MessagesData,
  SendMessagePayload,
  EditMessagePayload,
} from '../model/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derives the `participant` field from the `participants` array
 * by filtering out the current user.
 */
const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      return user._id || user.id || '';
    }
  } catch { /* noop */ }
  return '';
};

const mapConversation = (conv: any): Conversation => {
  const currentUserId = getCurrentUserId();
  const participants = conv.participants || [];
  const other = participants.find((p: MessageUser) => p._id !== currentUserId) || participants[0] || {
    _id: '',
    displayName: 'Unknown',
    permalink: '',
    avatarUrl: null,
  };

  return {
    _id: conv._id,
    participants,
    participant: other,
    lastMessage: conv.lastMessage || null,
    unreadCount: conv.unreadCount || 0,
    isBlocked: conv.isBlocked ?? false,
    isBlockedBy: conv.isBlockedBy ?? false,
    isFirstMessage: conv.isFirstMessage ?? false,
    createdAt: conv.createdAt || conv.updatedAt || '',
    updatedAt: conv.updatedAt || '',
  };
};

// ─── Conversations ───────────────────────────────────────────────────────────

/** GET /messages/conversations */
export const getConversations = async (page = 1, limit = 20): Promise<Conversation[]> => {
  const { data: res } = await apiClient.get<PaginatedResponse<ConversationsData>>(
    '/messages/conversations',
    { params: { page, limit } }
  );
  return (res.data.conversations || []).map(mapConversation);
};

/** GET /messages/{conversationId}/messages */
export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 20
): Promise<Message[]> => {
  const { data: res } = await apiClient.get<PaginatedResponse<MessagesData>>(
    `/messages/${conversationId}/messages`,
    { params: { page, limit } }
  );
  return res.data.messages || [];
};

// ─── Send ────────────────────────────────────────────────────────────────────

/** POST /messages */
export const sendMessage = async (
  receiverId: string,
  content: string,
  attachment?: { type: 'track' | 'playlist'; id: string }
): Promise<Message> => {
  const payload: SendMessagePayload = {
    receiverId,
    content,
  };

  if (attachment) {
    payload.attachmentType = attachment.type;
    payload.attachmentId = attachment.id;
  }

  const { data: res } = await apiClient.post<{ success: boolean; data: { message: Message } }>(
    '/messages',
    payload
  );
  return res.data.message;
};

/** POST /messages — send to a specific user (start or continue conversation) */
export const sendMessageToUser = async (
  receiverId: string,
  content: string,
  attachmentType?: 'track' | 'playlist',
  attachmentId?: string
): Promise<Message> => {
  const payload: SendMessagePayload = { receiverId, content };
  if (attachmentType && attachmentId) {
    payload.attachmentType = attachmentType;
    payload.attachmentId = attachmentId;
  }
  
  const { data: res } = await apiClient.post<{ success: boolean; data: { message: Message } }>(
    '/messages',
    payload
  );
  return res.data.message;
};

// ─── Start Conversation ──────────────────────────────────────────────────────

/** POST /messages — starting a new conversation sends a message to receiverId */
export const startConversation = async (
  userId: string,
  content: string,
  sharedTrack?: any,
  attachment?: { type: 'track' | 'playlist'; id: string }
): Promise<Conversation> => {
  const msg = await sendMessageToUser(
    userId,
    content,
    attachment?.type || (sharedTrack ? 'track' : undefined),
    attachment?.id || sharedTrack?.trackId
  );
  
  const conversations = await getConversations();
  const conv = conversations.find(
    (c) => c.participants.some((p) => p._id === userId) || c._id === msg.conversationId
  );
  if (conv) return conv;

  return {
    _id: msg.conversationId,
    participants: [],
    participant: { _id: userId, displayName: 'Unknown', permalink: userId, avatarUrl: null },
    lastMessage: msg,
    unreadCount: 0,
    isBlocked: false,
    isBlockedBy: false,
    isFirstMessage: false,
    createdAt: msg.createdAt,
    updatedAt: msg.createdAt,
  };
};

// ─── Read / Unread ───────────────────────────────────────────────────────────

/** PATCH /messages/conversations/{conversationId}/read */
export const markAsRead = async (conversationId: string): Promise<void> => {
  await apiClient.patch(`/messages/conversations/${conversationId}/read`);
};

/** Derived from conversations — no dedicated endpoint */
export const getUnreadCount = async (): Promise<number> => {
  const conversations = await getConversations();
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
};

// ─── Edit / Delete Messages ──────────────────────────────────────────────────

/** PATCH /messages/{messageId} */
export const editMessage = async (
  messageId: string,
  content: string
): Promise<Message> => {
  const payload: EditMessagePayload = { content };
  const { data: res } = await apiClient.patch<{ success: boolean; data: { message: Message } }>(
    `/messages/${messageId}`,
    payload
  );
  return res.data.message;
};

/** DELETE /messages/{messageId} — unsend */
export const deleteMessageForEveryone = async (messageId: string): Promise<Message> => {
  const { data: res } = await apiClient.delete<{ success: boolean; data: { message: Message } }>(
    `/messages/${messageId}`
  );
  return res.data.message;
};

/** DELETE /messages/{messageId}/me — delete for self */
export const deleteMessageForMe = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}/me`);
};

// ─── Delete Conversation ─────────────────────────────────────────────────────

/** DELETE /messages/conversations/{conversationId} */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/messages/conversations/${conversationId}`);
};

// ─── Block / Unblock ─────────────────────────────────────────────────────────

/** POST /users/{userId}/block */
export const blockUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/network/${userId}/block`);
};

/** DELETE /users/{userId}/block */
export const unblockUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/network/${userId}/block`);
};

// ─── User Search ─────────────────────────────────────────────────────────────

/** GET /tracks/search?q=...&type=users */
export const searchUsers = async (query: string): Promise<MessageUser[]> => {
  if (!query.trim()) return [];

  const { data: res } = await apiClient.get<{ 
    status?: string; 
    data: { users?: MessageUser[] } 
  }>(
    '/tracks/search',
    { params: { q: query, type: 'users' } }
  );
  return res.data?.users || [];
};

/** GET /profile/{permalink} - used as fallback to resolve recipient by username */
export const resolveUserByPermalink = async (permalink: string): Promise<string | null> => {
  try {
    const { data: res } = await apiClient.get<{ data: { user: { _id: string } } }>(
      `/profile/${encodeURIComponent(permalink)}`
    );
    // Support both direct data and nested user object
    const user = res.data?.user || (res.data as any);
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};
