import { createContext } from 'solid-js';

export const AuthContext = createContext<{isAuthenticated: () => boolean}>({isAuthenticated: () => false});
