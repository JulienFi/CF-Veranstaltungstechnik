import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { mount, waitFor, type MountedComponent } from '../test/reactTestUtils';

type AuthSnapshot = ReturnType<typeof useAuth>;
type SignInSnapshotResult = {
  error: Error | null;
  remainingAttempts?: number;
  blockedUntil?: number;
};

const {
  mockAdminMaybeSingle,
  mockSupabase,
  mockGetSession,
  mockSignInWithPassword,
  mockSignOut,
  mockCheckLimit,
  mockRecordFailedAttempt,
  mockResetAttempts,
  mockGetRemainingAttempts,
  mockGetBlockedTimeRemaining,
  mockSubscriptionUnsubscribe,
} = vi.hoisted(() => {
  const mockAdminMaybeSingle = vi.fn();
  const mockAdminEq = vi.fn(() => ({
    maybeSingle: mockAdminMaybeSingle,
  }));
  const mockAdminSelect = vi.fn(() => ({
    eq: mockAdminEq,
  }));

  const mockSupabase = {
    from: vi.fn(() => ({
      select: mockAdminSelect,
    })),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  };

  const mockSubscriptionUnsubscribe = vi.fn();

  const mockCheckLimit = vi.fn();
  const mockRecordFailedAttempt = vi.fn();
  const mockResetAttempts = vi.fn();
  const mockGetRemainingAttempts = vi.fn();
  const mockGetBlockedTimeRemaining = vi.fn();

  return {
    mockAdminMaybeSingle,
    mockSupabase,
    mockGetSession: mockSupabase.auth.getSession,
    mockSignInWithPassword: mockSupabase.auth.signInWithPassword,
    mockSignOut: mockSupabase.auth.signOut,
    mockCheckLimit,
    mockRecordFailedAttempt,
    mockResetAttempts,
    mockGetRemainingAttempts,
    mockGetBlockedTimeRemaining,
    mockSubscriptionUnsubscribe,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

vi.mock('../lib/rateLimiter', () => ({
  loginRateLimiter: {
    checkLimit: mockCheckLimit,
    recordFailedAttempt: mockRecordFailedAttempt,
    resetAttempts: mockResetAttempts,
    getRemainingAttempts: mockGetRemainingAttempts,
    getBlockedTimeRemaining: mockGetBlockedTimeRemaining,
  },
}));

function createUser(id: string, email: string) {
  return {
    id,
    email,
  } as { id: string; email: string | null };
}

function AuthProbe({ onSnapshot }: { onSnapshot: (value: AuthSnapshot) => void }) {
  const auth = useAuth();

  useEffect(() => {
    onSnapshot(auth);
  }, [auth, onSnapshot]);

  return <div>{auth.loading ? 'loading' : 'ready'}</div>;
}

describe('AuthProvider', () => {
  let mounted: MountedComponent | null = null;
  let latestSnapshot: AuthSnapshot | null = null;

  beforeEach(() => {
    latestSnapshot = null;
    vi.clearAllMocks();

    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockSubscriptionUnsubscribe,
        },
      },
    });
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: {
        user: null,
      },
    });
    mockSignOut.mockResolvedValue({ error: null });
    mockAdminMaybeSingle.mockResolvedValue({ data: null, error: null });

    mockCheckLimit.mockReturnValue(true);
    mockGetRemainingAttempts.mockReturnValue(4);
    mockGetBlockedTimeRemaining.mockReturnValue(0);
  });

  afterEach(async () => {
    if (mounted) {
      await mounted.unmount();
      mounted = null;
    }
  });

  it('loads admin state from initial session', async () => {
    const user = createUser('admin-1', 'admin@example.com');
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user,
        },
      },
    });
    mockAdminMaybeSingle.mockResolvedValue({
      data: { id: user.id },
      error: null,
    });

    mounted = await mount(
      <AuthProvider>
        <AuthProbe onSnapshot={(value) => { latestSnapshot = value; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(latestSnapshot?.loading).toBe(false);
      expect(latestSnapshot?.user?.id).toBe('admin-1');
      expect(latestSnapshot?.isAdmin).toBe(true);
    });
  });

  it('denies sign-in when user is not marked as admin in DB', async () => {
    const user = createUser('editor-1', 'editor@example.com');
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: {
        user,
      },
    });
    mockAdminMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mounted = await mount(
      <AuthProvider>
        <AuthProbe onSnapshot={(value) => { latestSnapshot = value; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(latestSnapshot?.loading).toBe(false);
    });

    const snapshot = latestSnapshot;
    if (!snapshot) {
      throw new Error('Auth snapshot is not available');
    }

    let signInResult!: SignInSnapshotResult;
    await act(async () => {
      signInResult = await snapshot.signIn('editor@example.com', 'secret');
    });

    expect(signInResult?.error?.message).toContain('Kein Admin-Zugriff');
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith('editor@example.com');
    expect(latestSnapshot?.isAdmin).toBe(false);
  });

  it('allows sign-in and sets admin state when DB flag is present', async () => {
    const user = createUser('admin-2', 'admin2@example.com');
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: {
        user,
      },
    });
    mockAdminMaybeSingle.mockResolvedValue({
      data: { id: user.id },
      error: null,
    });

    mounted = await mount(
      <AuthProvider>
        <AuthProbe onSnapshot={(value) => { latestSnapshot = value; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(latestSnapshot?.loading).toBe(false);
    });

    const snapshot = latestSnapshot;
    if (!snapshot) {
      throw new Error('Auth snapshot is not available');
    }

    let signInResult!: SignInSnapshotResult;
    await act(async () => {
      signInResult = await snapshot.signIn('admin2@example.com', 'secret');
    });

    expect(signInResult).toEqual({ error: null });
    expect(mockResetAttempts).toHaveBeenCalledWith('admin2@example.com');

    await waitFor(() => {
      expect(latestSnapshot?.user?.id).toBe('admin-2');
      expect(latestSnapshot?.isAdmin).toBe(true);
    });
  });

  it('returns blocked state when rate limiter denies login', async () => {
    mockCheckLimit.mockReturnValue(false);
    mockGetBlockedTimeRemaining.mockReturnValue(77);

    mounted = await mount(
      <AuthProvider>
        <AuthProbe onSnapshot={(value) => { latestSnapshot = value; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(latestSnapshot?.loading).toBe(false);
    });

    const snapshot = latestSnapshot;
    if (!snapshot) {
      throw new Error('Auth snapshot is not available');
    }

    let signInResult!: SignInSnapshotResult;
    await act(async () => {
      signInResult = await snapshot.signIn('blocked@example.com', 'secret');
    });

    expect(signInResult?.error?.message).toContain('Zu viele fehlgeschlagene Anmeldeversuche');
    expect(signInResult?.remainingAttempts).toBe(0);
    expect(signInResult?.blockedUntil).toBe(77);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});
