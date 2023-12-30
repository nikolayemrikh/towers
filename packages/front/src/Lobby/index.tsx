import { supabase } from '../supabaseClient'

export const Lobby = () => {
  return <main>
    <h1>Lobby</h1>
    <button onClick={() => supabase.auth.signOut()}>log out</button>
  </main>
}
