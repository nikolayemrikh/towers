import { supabaseServiceClient } from './supabaseServiceClient.ts';

export const notifyBoardStateChanged = async (boardId: number): Promise<void> => {
  const channel = supabaseServiceClient.channel(`board:${boardId}`);
  await channel.send({ type: 'broadcast', event: 'stateChanged' });
  await supabaseServiceClient.removeChannel(channel);
};
