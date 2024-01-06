import { A } from '@solidjs/router'
import { supabase } from '../supabaseClient'
import { For, createMemo, createResource } from 'solid-js'
import { User } from '@supabase/supabase-js';

const fetchUserBoards = async (user: User) => {
  const { data } = await supabase.from('card_tower').select('id, created_at, board!inner(id,turn_user_id,created_at)').eq('user_id', user.id)
  return data?.map(tower => {
    const board = tower.board;
    if (!board) throw new Error('Board can not be null')
    return board;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export const Lobby = () => {
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user!;
  }
  const [user] = createResource(fetchUser);
  const fetchUsersInLobby = async () => {
    const { data } = await supabase.from('user_in_lobby').select();
    return data;
  }
  // const fetchCardTower = async () => {
  //   const { data } = await supabase.from('card_tower').select().eq('user_id', user()?.id);
  //   return data;
  // }
  const [userBoards, {refetch: refetchUserBoards}] = createResource(user, (user) => fetchUserBoards(user));
  
  
  const [usersInLobby, { refetch }] = createResource(fetchUsersInLobby);

  const isInLobby = createMemo(() => !!user()?.id && !!usersInLobby()?.find(it => it.user_id === user()?.id));

  return <main>
    <h1>Lobby</h1>
    <div>Users in lobby: {usersInLobby()?.length ?? 0}</div>
    <div>Me in lobby: {isInLobby() ? 'Yes' : 'No'}</div>
    <div>
      {
        isInLobby()
          ? <button onClick={async () => {
            await supabase.from('user_in_lobby').delete().eq('user_id', user()?.id!)
            refetch();
          }}>Don't want to play</button>
          : <button onClick={async () => {
            await supabase.from('user_in_lobby').insert({user_id: user()?.id!});
            refetch()
          }}>Want to play</button>
      }
    </div>
    <div>{isInLobby() && usersInLobby()?.length === 1 && <button onClick={async () => {
      await supabase.functions.invoke('initialize-board');
      await refetchUserBoards();
    }}>Start game</button>}</div>
    <div>
      <h2>Your boards</h2>
      <div>
      <For each={userBoards()}>{(board, idx) => (
        <div>
          <A href={`/board/${board.id}`}>#{board.id} from {new Date(board.created_at).toLocaleString('ru-ru')}</A>
        </div>
      )}
      </For>
    </div>
    </div>
    <button onClick={() => supabase.auth.signOut()}>log out</button>
  </main>
}
