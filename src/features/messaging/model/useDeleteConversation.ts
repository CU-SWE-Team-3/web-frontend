import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteConversation } from '../api/messagingApi';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import { UNREAD_COUNT_QUERY_KEY } from './useUnreadCount';

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...CONVERSATIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [...UNREAD_COUNT_QUERY_KEY],
      });
    },
  });
};
