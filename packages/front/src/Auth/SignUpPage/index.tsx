import { createSignal } from 'solid-js';
import { supabase } from '../../supabaseClient'
import { A } from '@solidjs/router';

export const SignUpPage = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: email(),
      password: password()
    });
    if (error) {
      console.error(error);
    }
  }
  
  return <main>
    <h1>Sign Up</h1>
    <div>
      Already have an account? <A href="/sign-in">Sign in</A>
    </div>
    <form onSubmit={(event) => {
      event.preventDefault();
      signUp();
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
