import { createContext, createSignal, onMount } from 'solid-js';
import { supabase } from './supabaseClient'
import { Routes } from './Routes';

export const AuthContext = createContext<{isAuthenticated: () => boolean}>({isAuthenticated: () => false});

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
