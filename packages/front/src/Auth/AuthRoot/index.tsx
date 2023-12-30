import { A } from '@solidjs/router'

export const AuthRoot = () => {
  return <div>
    <div>
      <A href="/sign-in">Sign In</A>
    </div>
    <div>
      <A href="/sign-up">Sign Up</A>
    </div>
  </div>
}
