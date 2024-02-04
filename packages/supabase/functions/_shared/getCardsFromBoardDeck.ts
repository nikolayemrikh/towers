import { Database } from '../_shared/database-types.ts';
import { supabaseServiceClient } from '../_shared/supabaseServiceClient.ts';

export const getCardsFromBoardDeck = async (params: {
  boardId: number;
}): Promise<Database['public']['Tables']['card_in_board_deck']['Row'][]> => {
  const { boardId } = params;
  const { data, error } = await supabaseServiceClient
    .from('card_in_board_deck')
    .select('*')
    .eq('board_id', boardId)
    .order('id', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};
