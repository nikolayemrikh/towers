import { A, Navigate, Route, Router, useNavigate } from '@solidjs/router';
import { Board } from './Board';
import { createEffect, createResource, createSignal, onMount } from 'solid-js';
import { supabase } from './supabaseClient'
import { SignUpPage } from './Auth/SignUpPage';
import { SignInPage } from './Auth/SignInPage';
import { Lobby } from './Lobby';
import { AuthRoot } from './Auth/AuthRoot';

const AuthRoutes = () => {
  return (
    <Router>
      <Route path="/" component={AuthRoot} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
    </Router>
  )
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  onMount(() => {
    const checkAuthenticated = async () => {
      const session = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    }
    checkAuthenticated();
  
    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
  });

  return <div>{isAuthenticated() ? <Lobby /> : <AuthRoutes />}</div>;
}

export default App
