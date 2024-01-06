import { useParams } from '@solidjs/router';
import { Deck } from './Deck'
import { supabase } from '../supabaseClient';
import { For, createResource } from 'solid-js';


const fetchBoard = async (boardId: number) => {
  const [{data: boards, error: boardError }, {data: cardTowers}, {data: cardInBoardDeck}, {data: cardInBoardDiscardDeck}] = await Promise.all([
    supabase.from('board').select('id, created_at, turn_user_id').eq('board_id', boardId),
    supabase.from('card_tower').select('id, user_id').eq('board_id', boardId),
    supabase.from('card_in_board_deck').select('id, card_number').eq('board_id', boardId),
    supabase.from('card_in_board_discard_deck').select('id, card_number').eq('board_id', boardId),
  ]);

  if (!boards?.length) return null;
  if (boards.length > 1) throw new Error('Board must be unique');
  const board = boards[0];

  return {
    turnUserId: board.turn_user_id,
    cardTowers: cardTowers?.reduce((acc: Record<string, {id: number}>, cardTower) => {
      acc[cardTower.user_id] = {id: cardTower.id};
      return acc;
    }, {}),
    cardInBoardDeck: cardInBoardDeck?.map(cardInBoardDeck => ({
      id: cardInBoardDeck.id,
      cardNumber: cardInBoardDeck.card_number,
    })),
    cardInBoardDiscardDeck: cardInBoardDiscardDeck?.map(cardInBoardDiscardDeck => ({
      id: cardInBoardDiscardDeck.id,
      cardNumber: cardInBoardDiscardDeck.card_number,
    })),
  };
}

// const fetchCardTowers = async (boardId: number) => {
//   const { data } = await supabase.from('card_tower').select('id, created_at, user_id').eq('board_id', boardId)
//   return data;
// }

export const Board = () => {
  const { id } = useParams();

  const [board, {refetch: refetchBoard}] = createResource(() => fetchBoard(Number(id)));
  // const [cardTower, {refetch: refetchCardTowers}] = createResource(() => fetchCardTowers(Number(id)));
  
  return <div style={{height: '100%', padding: '16px'}}>
    {/* Decks horizontal list */}
    <div style={{display: 'flex', "flex-direction": "row", "justify-content": "space-between", "padding-left": "8px", "padding-right": "8px"}}>
      {/* {board()?.cardTowers && (
        <For each={Object.entries(board()?.cardTowers)}>{(cardTower, idx) => (
          <Deck key={idx} cardTowerId={cardTower.id} />
        )}</For>
      )} */}
      <Deck />
      <Deck />
    </div>
  </div>
}
