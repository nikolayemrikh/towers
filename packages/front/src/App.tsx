import { createSignal, onMount } from 'solid-js';
import { supabase } from './supabaseClient'
import { Routes } from './Routes';
import { AuthContext } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const queryClient = new QueryClient();

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

  return <QueryClientProvider client={queryClient}>
    <AuthContext.Provider value={{isAuthenticated}}>
      {isInitialized() ? <Routes /> : <div />}
    </AuthContext.Provider>
  </QueryClientProvider>;
}

export default App
