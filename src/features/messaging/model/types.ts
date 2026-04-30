// ─── Messaging Types (aligned with API spec) ────────────────────────────────

export interface MessageUser {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string | null;
  role?: string;
  isPremium?: boolean;
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

export interface SharedPlaylistPreview {
  playlistId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  trackCount: number;
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
  isBlocked?: boolean;         // Optional in v1.10
  isBlockedBy?: boolean;       // Optional in v1.10
  isFirstMessage?: boolean;    // Optional in v1.10
  createdAt?: string;          // Optional in v1.10
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
  attachment?: {
    type: 'track' | 'playlist';
    referenceId: string;
  };
}

export interface EditMessagePayload {
  content: string;
}
