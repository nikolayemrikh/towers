import { FC } from 'react';

import { Link } from 'react-router-dom';

import { EQueryKey } from '@front/core/query-key';
import { useQuery } from '@tanstack/react-query';

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
    queryFn: async () =>
      await supabase
        .from('card_tower')
        .select('id, created_at, board!inner(id,turn_user_id,created_at)')
        .eq('user_id', user!.id),
    select: (res) =>
      res.data
        ?.map((tower) => {
          const board = tower.board;
          if (!board) throw new Error('Board can not be null');
          return board;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
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
          <button
            onClick={async () => {
              await supabase.from('user_in_lobby').delete().eq('user_id', user.id);
              refetchUsersInLobby();
            }}
          >
            Don&apos;t want to play
          </button>
        ) : (
          <button
            onClick={async () => {
              await supabase.from('user_in_lobby').insert({ user_id: user.id });
              refetchUsersInLobby();
            }}
          >
            Want to play
          </button>
        )}
      </div>
      <div>
        {isInLobby && usersInLobby?.length === 1 && (
          <button
            onClick={async () => {
              await supabase.functions.invoke('initialize-board');
              await refetchUserBoards();
            }}
          >
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
