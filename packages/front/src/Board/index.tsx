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
import { UserTower } from './UserTower';
import { Card } from './Card';


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

// const createCarvVariantsQuery = () => {
//   return createQuery(() => ({
//     queryKey: [getGraphqlQueryKey(cardVariantsQueryDocument)],
//     queryFn: () => graphqlClient.request(cardVariantsQueryDocument),
//     select: (res) => new Map(res.card_variantCollection!.edges.map(({node}) => [node.number, node.power])),
//   }))
// }

const createCardVariantsQuery = () => {
  return createQuery(() => ({
    queryKey: ['card-variants'],
    queryFn: fetchCardVariants,
  }))
}

const createUserQuery = () => {
  return createQuery(() => ({
    queryKey: ['user'],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
  }))
}

export const Board = () => {
  const { id } = useParams();

  const userQuery = createUserQuery();
  // const [cardVariants] = createResource(() => fetchCardVariants());
  const cardVariantsQuery = createCardVariantsQuery();
  const boardQuery = createBoardQuery(id);

  const renderUserTower = () => {
    const user = userQuery.data;
    if (!user) return null;
    const board = boardQuery.data!.edges[0].node;
    const tower = boardQuery.data!.edges[0].node.card_towerCollection?.edges.filter(({node}) => node.user_id === user.id)[0].node;
    if (!tower) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    return <UserTower id={tower.id} cards={tower.card_in_towerCollection?.edges || []} userId={user.id} cardVariants={cardVariants} openedCardToUse={board.opened_card_number_to_use ?? null} />
  }

  const renderOtherUsersTowers = () => {
    const user = userQuery.data;
    if (!user) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    const towersEdges = boardQuery.data!.edges[0].node.card_towerCollection?.edges.filter(({node}) => node.user_id !== user.id);
    return <For each={towersEdges}>{({node: tower}) => (
      <Tower id={tower.id} userId={tower.user_id} cards={tower.card_in_towerCollection?.edges || []} cardVariants={cardVariants} />
    )}</For>;
  }

  return <div style={{height: '100%', padding: '16px'}}>
    <Switch>
      <Match when={boardQuery.isPending || userQuery.isPending || cardVariantsQuery.isPending}>Loading...</Match>
      <Match when={boardQuery.isError || userQuery.error || cardVariantsQuery.error}>Error</Match>
      <Match when={boardQuery.isSuccess && boardQuery.isSuccess && cardVariantsQuery.isSuccess}>
        <div>
          <div>Deck</div>
          <button onClick={async () => {
            await supabase.functions.invoke('pull-card', {body: {boardId: id}});
          }}>pull card</button>
          <div>Pulled card</div>
          <Switch>
            <Match when={boardQuery.data!.edges[0].node.pulled_card_number_to_change}>
              <Card
                number={boardQuery.data!.edges[0].node.pulled_card_number_to_change!}
                power={cardVariantsQuery.data!.get(boardQuery.data!.edges[0].node.pulled_card_number_to_change!)!}
                isActionAvailable={false}
                isProtected={false}
                onClick={() => {}}
              />
            </Match>
          </Switch>
        </div>
        <div>Towers</div>
        {/* Decks horizontal list */}
        <div style={{display: 'flex', "flex-direction": "row", "justify-content": "space-between", "padding-left": "8px", "padding-right": "8px"}}>
          {renderUserTower()}
          {renderOtherUsersTowers()}
        </div>
      </Match>
    </Switch>
  </div>
}
