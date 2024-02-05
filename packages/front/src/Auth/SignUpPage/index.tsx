import { FC, useState } from 'react';

import { Link } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';

import { supabase } from '../../supabaseClient';

export const SignUpPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: () => supabase.auth.signUp({ email, password }),
    onSuccess: ({ error }) => setIsError(!!error),
  });

  return (
    <main>
      <h1>Sign In</h1>
      <div>
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </div>
      {isError && <div>Sign up unsuccessful</div>}
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
