import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../messagingApi';

// ─── Mock apiClient ─────────────────────────────────────────────────────────
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '@/shared/api/client';

const mockedClient = vi.mocked(apiClient);

describe('messagingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage for getCurrentUserId
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'user') return JSON.stringify({ _id: 'current-user-id' });
      return null;
    });
  });

  // ─── getConversations ───────────────────────────────────────────────

  describe('getConversations', () => {
    it('should fetch conversations from /messages/conversations', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            conversations: [
              {
                _id: 'conv-1',
                participants: [
                  { _id: 'current-user-id', displayName: 'Me', permalink: 'me', avatarUrl: null },
                  { _id: 'u2', displayName: 'User 2', permalink: 'user2', avatarUrl: null },
                ],
                lastMessage: null,
                unreadCount: 2,
                updatedAt: '2026-01-01T00:00:00Z',
              },
            ],
            page: 1,
            hasMore: false,
          },
        },
      };
      mockedClient.get.mockResolvedValueOnce(mockResponse);

      const result = await api.getConversations();

      expect(mockedClient.get).toHaveBeenCalledWith('/messages/conversations', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('conv-1');
      // Should derive participant as the OTHER user (not current user)
      expect(result[0].participant._id).toBe('u2');
    });

    it('should return empty array when no conversations', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { conversations: [], page: 1, hasMore: false },
        },
      });

      const result = await api.getConversations();
      expect(result).toEqual([]);
    });
  });

  // ─── getMessages ────────────────────────────────────────────────────

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = [
        {
          _id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'u1',
          content: 'Hello!',
          attachment: null,
          status: 'sent',
          isEdited: false,
          isDeleted: false,
          deletedFor: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockedClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { messages: mockMessages, page: 1, hasMore: false },
        },
      });

      const result = await api.getMessages('conv-1');

      expect(mockedClient.get).toHaveBeenCalledWith('/messages/conv-1/messages', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockMessages);
    });

    it('should support pagination parameters', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { messages: [], page: 2, hasMore: false },
        },
      });

      await api.getMessages('conv-1', 2, 50);

      expect(mockedClient.get).toHaveBeenCalledWith('/messages/conv-1/messages', {
        params: { page: 2, limit: 50 },
      });
    });
  });

  // ─── sendMessageToUser ──────────────────────────────────────────────

  describe('sendMessageToUser', () => {
    it('should send a text message to a user', async () => {
      const mockMessage = {
        _id: 'msg-new',
        conversationId: 'conv-1',
        senderId: 'current-user-id',
        content: 'Hello!',
        attachment: null,
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        deletedFor: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockedClient.post.mockResolvedValueOnce({
        data: { success: true, data: { message: mockMessage } },
      });

      const result = await api.sendMessageToUser('u2', 'Hello!');

      expect(mockedClient.post).toHaveBeenCalledWith('/messages', {
        receiverId: 'u2',
        content: 'Hello!',
      });
      expect(result._id).toBe('msg-new');
    });

    it('should send a message with an attachment', async () => {
      const mockMessage = {
        _id: 'msg-new',
        conversationId: 'conv-1',
        senderId: 'current-user-id',
        content: 'Check this out!',
        attachment: { type: 'track', referenceId: 'track-1' },
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        deletedFor: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockedClient.post.mockResolvedValueOnce({
        data: { success: true, data: { message: mockMessage } },
      });

      const result = await api.sendMessageToUser('u2', 'Check this out!', 'track', 'track-1');

      expect(mockedClient.post).toHaveBeenCalledWith('/messages', {
        receiverId: 'u2',
        content: 'Check this out!',
        attachmentType: 'track',
        attachmentId: 'track-1',
      });
      expect(result.attachment?.type).toBe('track');
    });
  });

  // ─── markAsRead ─────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should call PATCH on the correct endpoint', async () => {
      mockedClient.patch.mockResolvedValueOnce({ data: { success: true } });

      await api.markAsRead('conv-1');

      expect(mockedClient.patch).toHaveBeenCalledWith('/messages/conversations/conv-1/read');
    });
  });

  // ─── editMessage ────────────────────────────────────────────────────

  describe('editMessage', () => {
    it('should edit a message', async () => {
      const updatedMsg = {
        _id: 'msg-1',
        content: 'Edited content',
        isEdited: true,
      };

      mockedClient.patch.mockResolvedValueOnce({
        data: { success: true, data: { message: updatedMsg } },
      });

      const result = await api.editMessage('msg-1', 'Edited content');

      expect(mockedClient.patch).toHaveBeenCalledWith('/messages/msg-1', { content: 'Edited content' });
      expect(result.isEdited).toBe(true);
    });
  });

  // ─── deleteMessageForEveryone ───────────────────────────────────────

  describe('deleteMessageForEveryone', () => {
    it('should delete a message for everyone', async () => {
      const deletedMsg = {
        _id: 'msg-1',
        isDeleted: true,
      };

      mockedClient.delete.mockResolvedValueOnce({
        data: { success: true, data: { message: deletedMsg } },
      });

      const result = await api.deleteMessageForEveryone('msg-1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/messages/msg-1/everyone');
      expect(result.isDeleted).toBe(true);
    });
  });

  // ─── deleteMessageForMe ────────────────────────────────────────────

  describe('deleteMessageForMe', () => {
    it('should delete a message for the current user only', async () => {
      mockedClient.delete.mockResolvedValueOnce({
        data: { success: true, message: 'Message deleted for you.' },
      });

      await api.deleteMessageForMe('msg-1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/messages/msg-1/me');
    });
  });

  // ─── deleteConversation ─────────────────────────────────────────────

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      mockedClient.delete.mockResolvedValueOnce({ data: { success: true } });

      await api.deleteConversation('conv-1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/messages/conversations/conv-1');
    });
  });

  // ─── blockUser / unblockUser ────────────────────────────────────────

  describe('blockUser', () => {
    it('should block a user', async () => {
      mockedClient.post.mockResolvedValueOnce({ data: { success: true } });

      await api.blockUser('u2');

      expect(mockedClient.post).toHaveBeenCalledWith('/network/u2/block');
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', async () => {
      mockedClient.delete.mockResolvedValueOnce({ data: { success: true } });

      await api.unblockUser('u2');

      expect(mockedClient.delete).toHaveBeenCalledWith('/network/u2/block');
    });
  });

  // ─── searchUsers ────────────────────────────────────────────────────

  describe('searchUsers', () => {
    it('should search for users', async () => {
      const mockUsers = [
        { _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null },
      ];

      mockedClient.get.mockResolvedValueOnce({
        data: { success: true, data: { users: mockUsers } },
      });

      const result = await api.searchUsers('User');

      expect(mockedClient.get).toHaveBeenCalledWith('/tracks/search', {
        params: { q: 'User', type: 'users' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array for empty query', async () => {
      const result = await api.searchUsers('');
      expect(result).toEqual([]);
      expect(mockedClient.get).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await api.searchUsers('   ');
      expect(result).toEqual([]);
      expect(mockedClient.get).not.toHaveBeenCalled();
    });
  });

  // ─── getUnreadCount ─────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should sum unread counts from all conversations', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            conversations: [
              { _id: 'c1', participants: [], unreadCount: 3, updatedAt: '2026-01-01T00:00:00Z' },
              { _id: 'c2', participants: [], unreadCount: 2, updatedAt: '2026-01-01T00:00:00Z' },
            ],
            page: 1,
            hasMore: false,
          },
        },
      });

      const count = await api.getUnreadCount();
      expect(count).toBe(5);
    });
  });
});
