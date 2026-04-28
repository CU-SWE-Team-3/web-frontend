import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startConversation } from '../api/messagingApi';
import type { Conversation, SharedTrackPreview } from './types';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';

interface StartConversationVars {
  userId: string;
  content: string;
  sharedTrack?: SharedTrackPreview | null;
  attachment?: { type: 'track' | 'playlist'; id: string };
}

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, StartConversationVars>({
    mutationFn: ({ userId, content, sharedTrack, attachment }) =>
      startConversation(userId, content, sharedTrack, attachment),
    onSuccess: (newConv) => {
      // Optimistically update the local cache so the conversation can be opened immediately (helpful for offline mocks)
      queryClient.setQueryData<Conversation[]>([...CONVERSATIONS_QUERY_KEY], (old = []) => {
        const exists = old.find((c) => c._id === newConv._id);
        if (exists) return old;
        return [newConv, ...old];
      });

      queryClient.invalidateQueries({
        queryKey: [...CONVERSATIONS_QUERY_KEY],
      });
    },
  });
};
