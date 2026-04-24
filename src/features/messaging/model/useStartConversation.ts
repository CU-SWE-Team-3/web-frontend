import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startConversation } from '../api/messagingApi';
import type { Conversation, SharedTrackPreview } from './types';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';

interface StartConversationVars {
  userId: string;
  content: string;
  sharedTrack?: SharedTrackPreview | null;
}

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, StartConversationVars>({
    mutationFn: ({ userId, content, sharedTrack }) =>
      startConversation(userId, content, sharedTrack),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...CONVERSATIONS_QUERY_KEY],
      });
    },
  });
};
