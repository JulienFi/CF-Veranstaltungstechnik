/**
 * Admin Guard Component
 *
 * SchÃ¼tzt Admin-Routen vor unbefugtem Zugriff.
 * PrÃ¼ft:
 * - Ist User authentifiziert?
 * - Ist User Admin? (Email-Matching)
 *
 * Bei fehlender Auth: Redirect zu /admin/login
 */

import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      console.warn('Unauthorized access to admin area - redirecting to login');
      window.location.href = '/admin/login';
    }
  }, [user, loading, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Authentifizierung prÃ¼fen...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
