import { createContext } from 'react';

export const AuthContext = createContext<{ isAuthenticated: boolean }>({ isAuthenticated: false });
