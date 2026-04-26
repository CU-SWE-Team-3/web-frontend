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
  conversationId: string,
  content: string,
  sharedTrack?: any
): Promise<Message> => {
  // We need to find the receiverId. On the backend, sending a message
  // requires a receiverId, not a conversationId. We resolve this by
  // first looking up the participant from cached conversation data,
  // or by passing a receiverId directly.
  // For existing conversations the caller should pass via the overload.

  const payload: SendMessagePayload = {
    receiverId: conversationId, // will be overridden by caller when possible
    content,
  };

  if (sharedTrack) {
    payload.attachmentType = 'track';
    payload.attachmentId = sharedTrack.trackId;
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
  sharedTrack?: any
): Promise<Conversation> => {
  const msg = await sendMessageToUser(
    userId,
    content,
    sharedTrack ? 'track' : undefined,
    sharedTrack?.trackId
  );
  // After sending, refetch conversations to get the full conversation object
  const conversations = await getConversations();
  const conv = conversations.find(
    (c) => c.participants.some((p) => p._id === userId)
  );
  if (conv) return conv;
  // Fallback: construct a minimal conversation from the message
  return {
    _id: msg.conversationId,
    participants: [],
    participant: { _id: userId, displayName: '', permalink: '', avatarUrl: null },
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

/** DELETE /messages/{messageId}/everyone — unsend */
export const deleteMessageForEveryone = async (messageId: string): Promise<Message> => {
  const { data: res } = await apiClient.delete<{ success: boolean; data: { message: Message } }>(
    `/messages/${messageId}/everyone`
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
// These aren't in the Messaging tag but are common social features.
// Adjust the endpoint once the backend confirms the exact path.

/** POST /users/{userId}/block */
export const blockUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/users/${userId}/block`);
};

/** DELETE /users/{userId}/block */
export const unblockUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}/block`);
};

// ─── User Search ─────────────────────────────────────────────────────────────

/** GET /users/search?q=... */
export const searchUsers = async (query: string): Promise<MessageUser[]> => {
  if (!query.trim()) return [];
  const { data: res } = await apiClient.get<{ success: boolean; data: { users: MessageUser[] } }>(
    '/users/search',
    { params: { q: query } }
  );
  return res.data.users || [];
};
