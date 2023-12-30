import { createSignal } from 'solid-js';
import { supabase } from '../../supabaseClient'
import { A } from '@solidjs/router';

export const SignInPage = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email(),
      password: password()
    });
    if (error) {
      console.error(error);
    }
  }
  
  return <main>
    <h1>Sign In</h1>
    <div>
      Don't have an account? <A href="/sign-up">Sign up</A>
    </div>
    <form onSubmit={(event) => {
      event.preventDefault();
      signIn();
    }}>
      <div>
        <label>
          Email
          <input type="email" onChange={(evt) => setEmail(evt.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Password
          <input type="new-password" onChange={(evt) => setPassword(evt.target.value)} />
        </label>
      </div>
      <div>
        <button type="submit">start</button>
      </div>
    </form>
  </main>;
}
