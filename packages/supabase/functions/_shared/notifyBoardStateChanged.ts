import { supabaseServiceClient } from './supabaseServiceClient.ts';

// @TODO uncomment when the "send" method will stop return 'error'
// export const notifyBoardStateChanged = async (boardId: number): Promise<void> => {
//   const channel = supabaseServiceClient.channel(`board:${boardId}`);
//   await channel.send({ type: 'broadcast', event: 'stateChanged' });
//   await supabaseServiceClient.removeChannel(channel);
// };

export const notifyBoardStateChanged = async (boardId: number): Promise<void> => {
  const channel = supabaseServiceClient.channel(`board:${boardId}`);
  await new Promise<void>((resolve) => {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolve();
    });
  });
  const res = await channel.send({ type: 'broadcast', event: 'stateChanged', payload: { message: 'asd' } });
  if (res !== 'ok') throw new Error('Can not notify that board state changed');
  await supabaseServiceClient.removeChannel(channel);
};
