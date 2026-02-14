import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface SignInResult {
  error: Error | null;
  remainingAttempts?: number;
  blockedUntil?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
