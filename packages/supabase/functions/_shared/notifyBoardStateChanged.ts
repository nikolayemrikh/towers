import { supabaseServiceClient } from './supabaseServiceClient.ts';

export const notifyBoardStateChanged = async (boardId: number): Promise<void> => {
  const channel = supabaseServiceClient.channel(`board:${boardId}`);
  channel.subscribe((status) => {
    if (status !== 'SUBSCRIBED') return null;

    channel.send({
      type: 'broadcast',
      event: 'stateChanged',
    });
  });
};
