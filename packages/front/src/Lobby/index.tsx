import { FC } from 'react';

import { Link } from 'react-router-dom';

import { getGraphqlQueryKey } from '@front/core/graphql/createGetQueryKet';
import { createGraphQLClient } from '@front/core/graphql/createGraphQLClient';
import { EQueryKey } from '@front/core/query-key';
import { User } from '@supabase/supabase-js';
import { useMutation, useQuery } from '@tanstack/react-query';

import { supabase } from '../supabaseClient';

import { cardTowersQueryDocument } from './graphql-documents/cardTowersQueryDocument';

const graphqlClient = createGraphQLClient();

export const Lobby: FC = () => {
  const { data: user } = useQuery({
    queryKey: [EQueryKey.user],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
  });

  const { data: usersInLobby, refetch: refetchUsersInLobby } = useQuery({
    queryKey: [EQueryKey.usersInLobby],
    queryFn: async () => await supabase.from('user_in_lobby').select(),
    select: (res) => res.data,
  });

  const { data: userBoards, refetch: refetchUserBoards } = useQuery({
    queryKey: [getGraphqlQueryKey(cardTowersQueryDocument), user?.id],
    enabled: !!user,
    queryFn: async ({ signal }) => {
      if (!user) throw new Error('User must be defined');
      return graphqlClient.request({
        document: cardTowersQueryDocument,
        signal,
        variables: { userId: user.id },
      });
    },
    select: (res) => res.card_towerCollection?.edges,
  });

  const initializeMutation = useMutation({
    mutationFn: () => supabase.functions.invoke('initialize-board'),
    onSuccess: () => refetchUserBoards(),
  });

  const enterLobbyMutation = useMutation({
    mutationFn: async (user: User) => supabase.from('user_in_lobby').insert({ user_id: user.id }),
    onSuccess: () => refetchUsersInLobby(),
  });

  const leaveLobbyMutation = useMutation({
    mutationFn: async (user: User) => supabase.from('user_in_lobby').delete().eq('user_id', user.id),
    onSuccess: () => refetchUsersInLobby(),
  });

  const isInLobby = !!user?.id && !!usersInLobby?.find((it) => it.user_id === user.id);

  if (!user) return null;

  return (
    <main>
      <h1>Lobby</h1>
      <div>Users in lobby: {usersInLobby?.length ?? 0}</div>
      <div>Me in lobby: {isInLobby ? 'Yes' : 'No'}</div>
      <div>
        {isInLobby ? (
          <button disabled={leaveLobbyMutation.isPending} onClick={() => leaveLobbyMutation.mutate(user)}>
            Don&apos;t want to play
          </button>
        ) : (
          <button disabled={enterLobbyMutation.isPending} onClick={() => enterLobbyMutation.mutate(user)}>
            Want to play
          </button>
        )}
      </div>
      <div>
        {isInLobby && usersInLobby?.length === 2 && (
          <button disabled={initializeMutation.isPending} onClick={() => initializeMutation.mutate()}>
            Start game
          </button>
        )}
      </div>
      <div>
        <h2>Your boards</h2>
        <div>
          {userBoards?.map(({ node: tower }) => (
            <div key={tower.board.id}>
              <Link to={`/board/${tower.board.id}`}>
                #{tower.board.id} from {new Date(tower.board.created_at).toLocaleString('ru-ru')}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()}>log out</button>
    </main>
  );
};
