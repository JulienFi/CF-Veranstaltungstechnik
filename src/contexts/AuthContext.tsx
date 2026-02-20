import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { loginRateLimiter } from '../lib/rateLimiter';
import { AuthContext, type SignInResult } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim() ?? '';

  const fetchIsAdmin = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Could not resolve admin status from admin_users:', error);
      return false;
    }

    const isDbAdmin = Boolean(data?.id);
    const currentEmail = currentUser.email?.toLowerCase().trim() ?? '';

    if (configuredAdminEmail && currentEmail === configuredAdminEmail && !isDbAdmin) {
      console.warn(
        'User email matches VITE_ADMIN_EMAIL but is not present in public.admin_users. Access denied until DB admin flag is set.'
      );
    }

    if (configuredAdminEmail && currentEmail !== configuredAdminEmail && isDbAdmin) {
      console.warn(
        'Admin user differs from VITE_ADMIN_EMAIL. DB admin flag is authoritative; update VITE_ADMIN_EMAIL if needed.'
      );
    }

    return isDbAdmin;
  }, [configuredAdminEmail]);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (nextUser: User | null) => {
      setLoading(true);
      const adminStatus = await fetchIsAdmin(nextUser);

      if (!isMounted) {
        return;
      }

      setUser(nextUser);
      setIsAdmin(adminStatus);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncAuthState(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchIsAdmin]);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const identifier = email.toLowerCase();

    if (!loginRateLimiter.checkLimit(identifier)) {
      const blockedTime = loginRateLimiter.getBlockedTimeRemaining(identifier);
      return {
        error: new Error('Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es spaeter erneut.'),
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
        throw new Error('E-Mail oder Passwort ist ungueltig.');
      }

      const nextUser = data.user ?? null;
      const hasAdminAccess = await fetchIsAdmin(nextUser);
      if (!hasAdminAccess) {
        await supabase.auth.signOut();
        loginRateLimiter.recordFailedAttempt(identifier);
        throw new Error('Kein Admin-Zugriff. Bitte wenden Sie sich an den Systemadministrator.');
      }

      loginRateLimiter.resetAttempts(identifier);
      setUser(nextUser);
      setIsAdmin(true);

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
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
