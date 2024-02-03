import { FC } from 'react';

import { Navigate, useParams } from 'react-router-dom';

import { EQueryKey } from '@front/core/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getGraphqlQueryKey } from '../core/graphql/createGetQueryKet';
import { createGraphQLClient } from '../core/graphql/createGraphQLClient';
import { supabase } from '../supabaseClient';

import { Card } from './Card';
import { fetchCardVariants } from './fetchers/fetchCardVariants';
import { boardQueryDocument } from './graphql-documents/boardQueryDocument';
import { Tower } from './Tower';
import { UserTower } from './UserTower';

const graphqlClient = createGraphQLClient();

// import { cardVariantsQueryDocument } from './graphql-documents/cardVariantsQueryDocument';
// const createCarvVariantsQuery = () => {
//   return createQuery(() => ({
//     queryKey: [getGraphqlQueryKey(cardVariantsQueryDocument)],
//     queryFn: () => graphqlClient.request(cardVariantsQueryDocument),
//     select: (res) => new Map(res.card_variantCollection!.edges.map(({node}) => [node.number, node.power])),
//   }))
// }

export const Board: FC = () => {
  const { id } = useParams();
  if (!id) throw new Error('Board id is required');

  const { data: user } = useQuery({
    queryKey: [EQueryKey.user],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
  });
  const { data: cardVariants } = useQuery({
    queryKey: [EQueryKey.cardVariants],
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

  if (!boardQuery.data || !user || !cardVariants) return null;
  const board = boardQuery.data.edges[0]?.node;

  if (!board) return <Navigate to="/lobby" />;

  const openedCards = board.card_in_board_openedCollection?.edges;
  const userTower = board.card_towerCollection?.edges.filter(({ node }) => node.user_id === user.id)[0].node;

  if (!userTower) throw new Error('User tower must be defined');

  const otherTowers = board.card_towerCollection?.edges.filter(({ node }) => node.user_id !== user.id);

  return (
    <div style={{ height: '100%', padding: '16px' }}>
      <div>
        <div>Deck</div>
        {!!boardQuery.data?.edges[0].node.card_in_board_deckCollection?.edges.length && (
          <button onClick={() => pullCardMutation.mutate(id)}>pull card</button>
        )}
        <div>Pulled card</div>
        {board.pulled_card_number_to_change && (
          <Card
            number={board.pulled_card_number_to_change}
            power={cardVariants.get(board.pulled_card_number_to_change)!}
            isActionAvailable={false}
            isProtected={false}
          />
        )}
        <div>Opened cards</div>
        {openedCards?.map(({ node: openedCard }) => (
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
        ))}
        <div>Selected opened card</div>
        {board.opened_card_number_to_use && (
          <Card
            number={board.opened_card_number_to_use}
            power={cardVariants.get(board.opened_card_number_to_use)!}
            isActionAvailable={false}
            isProtected={false}
          />
        )}
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
        <UserTower
          id={userTower.id}
          boardId={board.id}
          cards={userTower.card_in_towerCollection?.edges || []}
          userId={user.id}
          cardVariants={cardVariants}
          openedCardToUse={board.opened_card_number_to_use ?? null}
          pulledCardToChange={board.pulled_card_number_to_change ?? null}
        />
        {otherTowers?.map(({ node: tower }) => (
          <Tower
            key={tower.id}
            id={tower.id}
            userId={tower.user_id}
            cards={tower.card_in_towerCollection?.edges || []}
            cardVariants={cardVariants}
          />
        ))}
      </div>
    </div>
  );
};
