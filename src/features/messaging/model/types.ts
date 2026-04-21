// ─── Messaging Types (aligned with API spec) ────────────────────────────────

export interface MessageUser {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string | null;
  role?: string;
}

export interface Attachment {
  type: 'track' | 'playlist';
  referenceId: string;
}

export interface SharedTrackPreview {
  trackId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  duration: number; // seconds
  trackUrl: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  sender?: MessageUser;       // populated on the frontend from participants
  content: string;
  attachment: Attachment | null;
  sharedTrack?: SharedTrackPreview | null; // kept for UI backward compat
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: string[];
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;     // kept for backward compat
}

export interface Conversation {
  _id: string;
  participants: MessageUser[];
  participant: MessageUser;   // derived: the OTHER user (not current user)
  lastMessage: Message | null;
  unreadCount: number;
  isBlocked: boolean;         // current user blocked this participant
  isBlockedBy: boolean;       // this participant blocked current user
  isFirstMessage: boolean;    // show first-message safety banner
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
}

export interface ConversationsData {
  conversations: Conversation[];
  page: number;
  hasMore: boolean;
}

export interface MessagesData {
  messages: Message[];
  page: number;
  hasMore: boolean;
}

export interface SendMessagePayload {
  receiverId: string;
  content?: string;
  attachmentType?: 'track' | 'playlist';
  attachmentId?: string;
}

export interface EditMessagePayload {
  content: string;
}
