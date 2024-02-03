import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { FC, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export const SignInPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: () => supabase.auth.signInWithPassword({ email, password }),
    onSuccess: ({ error }) => setIsError(!!error),
  });

  return (
    <main>
      <h1>Sign In</h1>
      <div>
        Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
      </div>
      {isError && <div>Sign in unsuccessful</div>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
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
          <button type="submit" disabled={mutation.isPending}>
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
};
