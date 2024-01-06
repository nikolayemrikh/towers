import { useNavigate } from '@solidjs/router'
import { supabase } from '../supabaseClient'
import { createMemo, createResource } from 'solid-js'
import { UserBoards } from './UserBoards';

export const Lobby = () => {
  const navigate = useNavigate();
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
  const [usersInLobby, { refetch }] = createResource(fetchUsersInLobby);
  // const [cardTower] = createResource(fetchCardTower);

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
    <div>{isInLobby() && <button onClick={async () => {
      const { data } = await supabase.functions.invoke('initialize-board');
      if (data) {
        navigate(`/board/${data.newBoard.id}`)
      }
    }}>Start game</button>}</div>
    <div>
      <h2>Your boards</h2>
      <UserBoards user={user} />
    </div>
    <button onClick={() => supabase.auth.signOut()}>log out</button>
  </main>
}
