import { Route, Router, useNavigate } from '@solidjs/router';
import { children, createContext, createEffect, createSignal, onMount, useContext } from 'solid-js';
import { supabase } from './supabaseClient'
import { SignUpPage } from './Auth/SignUpPage';
import { SignInPage } from './Auth/SignInPage';
import { Lobby } from './Lobby';

export const AuthContext = createContext<{isAuthenticated: () => boolean}>({isAuthenticated: () => false});

const DetectRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return <div>{isAuthenticated() ? <NotAuthenticatedRoute /> : <AuthRoute />}</div>
}

const AuthRoute = (props: any) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const c = children(() => props.children);

  createEffect(() => {    
    if (!isAuthenticated()) {
      navigate('/sign-in');
    }
  });

  return <div>{isAuthenticated() ? c() : <div />}</div>
}

const NotAuthenticatedRoute = (props: any) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const c = children(() => props.children);

  createEffect(() => {
    if (isAuthenticated()) {      
      navigate('/lobby');
    }
  });

  return <div>{isAuthenticated() ? <div /> : c()}</div>
}

const Routes = () => {
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

const App = () => {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  onMount(() => {
    const checkAuthenticated = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsInitialized(true);

      supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
    }
    checkAuthenticated();
  });

  return <AuthContext.Provider value={{isAuthenticated}}>
    {isInitialized() ? <Routes /> : <div />}
  </AuthContext.Provider>;
}

export default App
