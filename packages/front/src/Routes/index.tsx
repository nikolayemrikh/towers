import { Navigate, Route, RouteSectionProps, Router } from '@solidjs/router';
import { children, useContext } from 'solid-js';
import { SignUpPage } from '../Auth/SignUpPage';
import { SignInPage } from '../Auth/SignInPage';
import { Lobby } from '../Lobby';
import { AuthContext } from '../context/AuthContext';


const DetectRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return <div>{isAuthenticated() ? <Navigate href="/lobby" /> : <Navigate href="/sign-in" />}</div>
}

const AuthRoute = (props: RouteSectionProps) => {
  const { isAuthenticated } = useContext(AuthContext);
  const c = children(() => props.children);

  return <div>{isAuthenticated() ? c() : <Navigate href="/sign-in" />}</div>
}

const NotAuthenticatedRoute = (props: RouteSectionProps) => {
  const { isAuthenticated } = useContext(AuthContext);
  const c = children(() => props.children);

  return <div>{isAuthenticated() ? <Navigate href="/lobby" /> : c()}</div>
}

export const Routes = () => {
  return (
    <Router>
      <Route component={AuthRoute}>
        <Route path="/lobby" component={Lobby} />
      </Route>
      <Route component={NotAuthenticatedRoute}>
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
      </Route>
      <Route path="/*all" component={DetectRoute} />
    </Router>
  )
}
