import { useParams } from '@solidjs/router';
import { Tower } from './Tower'
import { For, Match, Switch, createEffect, createResource } from 'solid-js';
import { fetchCardVariants } from './fetchers/fetchCardVariants';
import { createQuery } from '@tanstack/solid-query';
import { createGraphQLClient } from '../core/graphql/createGraphQLClient';
import { boardQueryDocument } from './graphql-documents/boardQueryDocument';
import { getGraphqlQueryKey } from '../core/graphql/createGetQueryKet';
import { supabase } from '../supabaseClient';
import { cardVariantsQueryDocument } from './graphql-documents/cardVariantsQueryDocument';


// const fetchBoard = async (boardId: number) => {
//   const [{data: boards, error: boardError }, {data: cardTowers}, {data: cardInBoardDeck}, {data: cardInBoardDiscardDeck}] = await Promise.all([
//     supabase.from('board').select('id, created_at, turn_user_id').eq('id', boardId),
//     // supabase.from('card_tower').select('id, user_id').eq('board_id', boardId),
//     supabase.from('card_tower').select('id, user_id, card_in_tower (id, card_number)').eq('board_id', boardId),
//     supabase.from('card_in_board_deck').select('id, card_number').eq('board_id', boardId),
//     supabase.from('card_in_board_discard_deck').select('id, card_number').eq('board_id', boardId),
//   ]);

//   if (!boards?.length) return null;
//   if (boards.length > 1) throw new Error('Board must be unique');
//   const board = boards[0];

//   return {
//     turnUserId: board.turn_user_id,
//     cardTowers: cardTowers?.reduce((acc: Record<string, {id: number; cards: {id: number;card_number: number;}[]}>, cardTower) => {
//       acc[cardTower.user_id] = {id: cardTower.id, cards: cardTower.card_in_tower };
//       return acc;
//     }, {}),
//     cardInBoardDeck: cardInBoardDeck?.map(cardInBoardDeck => ({
//       id: cardInBoardDeck.id,
//       cardNumber: cardInBoardDeck.card_number,
//     })),
//     cardInBoardDiscardDeck: cardInBoardDiscardDeck?.map(cardInBoardDiscardDeck => ({
//       id: cardInBoardDiscardDeck.id,
//       cardNumber: cardInBoardDiscardDeck.card_number,
//     })),
//   };
// }

const graphqlClient = createGraphQLClient();

const createBoardQuery = (boardId: string) => {
  return createQuery(() => ({
    queryKey: [getGraphqlQueryKey(boardQueryDocument), boardId],
    queryFn: () => graphqlClient.request(boardQueryDocument, { boardId }),
    select: (res) => res.boardCollection,
  }))
}

const createCarvVariantsQuery = () => {
  return createQuery(() => ({
    queryKey: [getGraphqlQueryKey(cardVariantsQueryDocument)],
    queryFn: () => graphqlClient.request(cardVariantsQueryDocument),
    select: (res) => new Map(res.card_variantCollection!.edges.map(({node}) => [node.number, node.power])),
  }))
}

export const Board = () => {
  const { id } = useParams();

  const [cardVariants] = createResource(() => fetchCardVariants());
  // const cardVariantsQuery = createCarvVariantsQuery();
  const boardQuery = createBoardQuery(id);

  return <div style={{height: '100%', padding: '16px'}}>
    <Switch>
      <Match when={boardQuery.isPending}>Loading...</Match>
      <Match when={boardQuery.isError}>Error: {boardQuery.error?.message}</Match>
      <Match when={boardQuery.isSuccess}>
        {/* Decks horizontal list */}
        <div style={{display: 'flex', "flex-direction": "row", "justify-content": "space-between", "padding-left": "8px", "padding-right": "8px"}}>
          <For each={boardQuery.data!.edges[0].node.card_towerCollection?.edges}>{({node: tower}) => (
            <Tower id={tower.id} userId={tower.user_id} cards={tower.card_in_towerCollection?.edges || []} cardVariants={cardVariants} />
          )}</For>
        </div>
        <div>
          <div>Deck</div>
          <button onClick={async () => {
            await supabase.functions.invoke('pull-card', {body: {boardId: id}});
          }}>pull card</button>
          <div>Pulled card</div>
          {boardQuery.data!.edges[0].node.pulled_card_number_to_change && <div>{cardVariants()?.get(boardQuery.data!.edges[0].node.pulled_card_number_to_change)}</div>}
        </div>
      </Match>
    </Switch>
  </div>
}
