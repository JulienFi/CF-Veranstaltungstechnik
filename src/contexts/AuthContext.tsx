/**
 * Auth Context mit Supabase Auth und Rate Limiting
 *
 * Bietet sichere Authentifizierung mit:
 * - Supabase Auth (JWT-basiert, HttpOnly Cookies)
 * - Rate Limiting gegen Brute-Force
 * - Session Management
 * - Admin-Email-Validierung
 */

import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { loginRateLimiter } from '../lib/rateLimiter';
import { AuthContext, type SignInResult } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cf-veranstaltungstechnik.de';

  const isAdmin = user?.email?.toLowerCase() === adminEmail.toLowerCase();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const identifier = email.toLowerCase();

    if (!loginRateLimiter.checkLimit(identifier)) {
      const blockedTime = loginRateLimiter.getBlockedTimeRemaining(identifier);
      return {
        error: new Error('Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.'),
        remainingAttempts: 0,
        blockedUntil: blockedTime,
      };
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        loginRateLimiter.recordFailedAttempt(identifier);
        throw new Error('E-Mail oder Passwort ist ungültig.');
      }

      if (data.user?.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        await supabase.auth.signOut();
        loginRateLimiter.recordFailedAttempt(identifier);
        throw new Error('E-Mail oder Passwort ist ungültig.');
      }

      loginRateLimiter.resetAttempts(identifier);
      console.log('Admin erfolgreich angemeldet:', data.user.email);

      return { error: null };
    } catch (error) {
      const remaining = loginRateLimiter.getRemainingAttempts(identifier);
      return {
        error: error as Error,
        remainingAttempts: remaining,
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
