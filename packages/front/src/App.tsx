import { FC, useEffect, useState } from 'react';
import { StrictMode } from 'react';

import { BrowserRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthContext } from './context/AuthContext';
import { Routes } from './Routes';
import { supabase } from './supabaseClient';

const queryClient = new QueryClient();

export const App: FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async (): Promise<void> => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsInitialized(true);

      supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
    })();
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ isAuthenticated }}>
          <BrowserRouter>{isInitialized && <Routes />}</BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </StrictMode>
  );
};
