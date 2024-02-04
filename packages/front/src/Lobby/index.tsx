import { FC } from 'react';

import { Link } from 'react-router-dom';

import { EQueryKey } from '@front/core/query-key';
import { User } from '@supabase/supabase-js';
import { useMutation, useQuery } from '@tanstack/react-query';

import { supabase } from '../supabaseClient';

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
    queryKey: [EQueryKey.userBoards],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('User can not be null');
      return await supabase
        .from('card_tower')
        .select('id, created_at, board!inner(id,turn_user_id,created_at)')
        .eq('user_id', user.id);
    },
    select: (res) =>
      res.data
        ?.map((tower) => {
          const board = tower.board;
          if (!board) throw new Error('Board can not be null');
          return board;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
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
        {isInLobby && usersInLobby?.length === 1 && (
          <button disabled={initializeMutation.isPending} onClick={() => initializeMutation.mutate()}>
            Start game
          </button>
        )}
      </div>
      <div>
        <h2>Your boards</h2>
        <div>
          {userBoards?.map((board) => (
            <div key={board.id}>
              <Link to={`/board/${board.id}`}>
                #{board.id} from {new Date(board.created_at).toLocaleString('ru-ru')}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()}>log out</button>
    </main>
  );
};
