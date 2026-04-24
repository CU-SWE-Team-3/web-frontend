// ─── Public API for the messaging feature ────────────────────────────────────
// Other parts of the app should only import from this file.

export * from './model/types';
export { useConversations } from './model/useConversations';
export { useMessages } from './model/useMessages';
export { useSendMessage } from './model/useSendMessage';
export { useStartConversation } from './model/useStartConversation';
export { useUnreadCount } from './model/useUnreadCount';
export { useBlockUser, useUnblockUser } from './model/useBlockUser';
export { useMarkAsRead } from './model/useMarkAsRead';
export { useDeleteConversation } from './model/useDeleteConversation';
export { MessagesPage } from './ui/MessagesPage';
