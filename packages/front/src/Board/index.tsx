import { FC } from 'react';

import { useParams } from 'react-router-dom';

import { EQueryKey } from '@front/core/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getGraphqlQueryKey } from '../core/graphql/createGetQueryKet';
import { createGraphQLClient } from '../core/graphql/createGraphQLClient';
import { supabase } from '../supabaseClient';

import { Card } from './Card';
import { fetchCardVariants } from './fetchers/fetchCardVariants';


import { boardQueryDocument } from './graphql-documents/boardQueryDocument';


import { cardVariantsQueryDocument } from './graphql-documents/cardVariantsQueryDocument';
import { Tower } from './Tower';
import { UserTower } from './UserTower';

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

// const createBoardQuery = (boardId: string) => {
//   return useQuery(() => ({
//     queryKey: [getGraphqlQueryKey(boardQueryDocument), boardId],
//     queryFn: () => graphqlClient.request(boardQueryDocument, { boardId }),
//     select: (res) => res.boardCollection,
//   }));
// };

// const createCarvVariantsQuery = () => {
//   return createQuery(() => ({
//     queryKey: [getGraphqlQueryKey(cardVariantsQueryDocument)],
//     queryFn: () => graphqlClient.request(cardVariantsQueryDocument),
//     select: (res) => new Map(res.card_variantCollection!.edges.map(({node}) => [node.number, node.power])),
//   }))
// }

export const Board: FC = () => {
  const { id } = useParams();

  const { data: user } = useQuery({
    queryKey: [EQueryKey.user],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
  });
  // const [cardVariants] = createResource(() => fetchCardVariants());
  const cardVariantsQuery = useQuery({
    queryKey: ['card-variants'],
    queryFn: fetchCardVariants,
  });
  const boardQuery = useQuery({
    queryKey: [getGraphqlQueryKey(boardQueryDocument), id],
    queryFn: () => graphqlClient.request(boardQueryDocument, { boardId: id }),
    select: (res) => res.boardCollection,
  });

  const pullCardMutation = useMutation({
    mutationFn: (boardId: string) => supabase.functions.invoke('pull-card', { body: { boardId } }),
    onSuccess: () => boardQuery.refetch(),
  });

  const selectOpenedCardMutation = useMutation({
    mutationFn: (payload: { boardId: string; cardNumber: number }) =>
      supabase.functions.invoke('select-opened-card', { body: payload }),
    onSuccess: () => boardQuery.refetch(),
  });

  const renderUserTower = () => {
    if (!user) return null;
    const board = boardQuery.data!.edges[0].node;
    const tower = boardQuery.data!.edges[0].node.card_towerCollection?.edges.filter(
      ({ node }) => node.user_id === user.id
    )[0].node;
    if (!tower) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    return (
      <UserTower
        id={tower.id}
        boardId={board.id}
        cards={tower.card_in_towerCollection?.edges || []}
        userId={user.id}
        cardVariants={cardVariants}
        openedCardToUse={board.opened_card_number_to_use ?? null}
        pulledCardToChange={board.pulled_card_number_to_change ?? null}
      />
    );
  };

  const renderOtherUsersTowers = () => {
    if (!user) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    const towersEdges = boardQuery.data!.edges[0].node.card_towerCollection?.edges.filter(
      ({ node }) => node.user_id !== user.id
    );
    return towersEdges?.map(({ node: tower }) => (
      <Tower
        key={tower.id}
        id={tower.id}
        userId={tower.user_id}
        cards={tower.card_in_towerCollection?.edges || []}
        cardVariants={cardVariants}
      />
    ));
  };

  const renderPulledCard = () => {
    const board = boardQuery.data!.edges[0].node;
    if (!board.pulled_card_number_to_change) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    return (
      <Card
        number={board.pulled_card_number_to_change}
        power={cardVariants.get(board.pulled_card_number_to_change)!}
        isActionAvailable={false}
        isProtected={false}
      />
    );
  };

  const renderSelectedOpened = () => {
    const board = boardQuery.data!.edges[0].node;
    if (!board.opened_card_number_to_use) return null;
    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;
    return (
      <Card
        number={board.opened_card_number_to_use}
        power={cardVariants.get(board.opened_card_number_to_use)!}
        isActionAvailable={false}
        isProtected={false}
      />
    );
  };

  const renderOpenedCards = () => {
    const board = boardQuery.data!.edges[0].node;
    const openedCards = boardQuery.data!.edges[0].node.card_in_board_openedCollection?.edges;

    const cardVariants = cardVariantsQuery.data;
    if (!cardVariants) return null;

    return openedCards?.map(({ node: openedCard }) => (
      <Card
        key={openedCard.id}
        number={openedCard.card_number}
        power={cardVariants.get(openedCard.card_number)!}
        isActionAvailable={!board.pulled_card_number_to_change}
        isProtected={false}
        onClick={() => {
          if (board.opened_card_number_to_use) return true;
          selectOpenedCardMutation.mutate({ boardId: board.id, cardNumber: openedCard.card_number });
        }}
      />
    ));
  };

  if (!boardQuery.data || !user || !cardVariantsQuery.data) return null;

  return (
    <div style={{ height: '100%', padding: '16px' }}>
      <div>
        <div>Deck</div>
        {!!boardQuery.data?.edges[0].node.card_in_board_deckCollection?.edges.length && (
          <button onClick={() => pullCardMutation.mutate(id)}>pull card</button>
        )}
        <div>Pulled card</div>
        {renderPulledCard()}
        <div>Opened cards</div>
        {renderOpenedCards()}
        <div>Selected opened card</div>
        {renderSelectedOpened()}
      </div>
      <div>Towers</div>
      {/* Decks horizontal list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: '8px',
          paddingRight: '8px',
        }}
      >
        {renderUserTower()}
        {renderOtherUsersTowers()}
      </div>
    </div>
  );
};
