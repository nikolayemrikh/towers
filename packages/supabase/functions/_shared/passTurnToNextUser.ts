import { Database } from '../_shared/database-types.ts';
import { supabaseServiceClient } from '../_shared/supabaseServiceClient.ts';

export const passTurnToNextUser = async (
  boardId: number,
  currentUserId: string,
  cardTowers: Database['public']['Tables']['card_tower']['Row'][]
): Promise<void> => {
  // const { data: cardTowers, error: cardTowersError } = await supabaseServiceClient
  //   .from('card_tower')
  //   .select('*')
  //   .eq('board_id', boardId);
  // if (cardTowersError) throw new Error(cardTowersError.message);

  const currentUserCardTowerIndex = cardTowers.findIndex((cardTower) => cardTower.user_id === currentUserId);
  const nextUserCardTower =
    cardTowers[cardTowers.length - 1 === currentUserCardTowerIndex ? 0 : currentUserCardTowerIndex + 1];

  const { error: boardsUpdateError1 } = await supabaseServiceClient
    .from('board')
    .update({ turn_user_id: nextUserCardTower.user_id })
    .eq('id', boardId);
  if (boardsUpdateError1) throw new Error(boardsUpdateError1.message);
};
