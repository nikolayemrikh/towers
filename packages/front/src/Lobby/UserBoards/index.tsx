import { supabase } from '../../supabaseClient';
import { A } from '@solidjs/router';
import { User } from '@supabase/supabase-js';
import { For, Resource, createResource } from 'solid-js';

const fetchTower = async (user: User) => {
  const { data } = await supabase.from('card_tower').select().eq('user_id', user.id);
  return data;
}

export const UserBoards = (props: {user: Resource<User>}) => {
  const {user} = props;
  const [towers] = createResource(user, (user) => fetchTower(user));

  return (
    <div>
      <For each={towers()}>{(tower, idx) => (
        <div>
          <A href={`/board/${tower.id}}`}>{idx() + 1}</A>
        </div>
      )}
      </For>
    </div>
  )
}
