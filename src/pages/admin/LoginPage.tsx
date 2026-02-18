/**
 * Admin Login Page mit erhÃ¶hter Sicherheit
 *
 * Features:
 * - Rate Limiting (5 Versuche / 15 Min)
 * - Generische Fehlermeldungen
 * - Verbleibende Versuche anzeigen
 * - Auto-Redirect nach Login
 * - Supabase Auth Integration
 */

import { useState } from 'react';
import { Lock, Mail, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { COMPANY_INFO } from '../../config/company';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setRemainingAttempts(null);
    setBlockedUntil(null);
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error.message);

      if (result.remainingAttempts !== undefined) {
        setRemainingAttempts(result.remainingAttempts);
      }

      if (result.blockedUntil !== undefined) {
        setBlockedUntil(result.blockedUntil);
      }

      setLoading(false);
    } else {
      setSuccessMessage('Anmeldung erfolgreich. Sie werden weitergeleitet...');
      window.setTimeout(() => {
        window.location.href = '/admin';
      }, 400);
    }
  };

  const formatBlockedTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    }
    return `${remainingSeconds} Sekunde${remainingSeconds > 1 ? 'n' : ''}`;
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-2xl">CF</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin-Bereich</h1>
          <p className="text-gray-400">{COMPANY_INFO.name}</p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center space-x-2 mb-6 text-gray-400">
            <Shield className="w-5 h-5" />
            <p className="text-sm">Sicherer Login mit Rate-Limiting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || blockedUntil !== null}
                  className="w-full pl-11 pr-4 py-3 bg-card-hover border border-card rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || blockedUntil !== null}
                  className="w-full pl-11 pr-4 py-3 bg-card-hover border border-card rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-medium">{error}</p>

                    {remainingAttempts !== null && remainingAttempts > 0 && (
                      <p className="text-xs text-red-300 mt-2">
                        Noch {remainingAttempts} Versuch{remainingAttempts > 1 ? 'e' : ''} verbleibend
                      </p>
                    )}

                    {blockedUntil !== null && blockedUntil > 0 && (
                      <p className="text-xs text-red-300 mt-2">
                        Gesperrt für {formatBlockedTime(blockedUntil)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4" role="status" aria-live="polite">
                <p className="text-sm text-green-300 font-medium">{successMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || blockedUntil !== null}
              className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
            >
              {loading ? 'Anmeldung läuft...' : blockedUntil ? 'Gesperrt' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-card">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                <strong className="text-blue-400">Sicherheitshinweis:</strong> Dieser Login ist durch Rate-Limiting geschützt (max. 5 Versuche pro 15 Minuten). Admin-Zugang nur für autorisierte Personen.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
            ← Zurück zur Website
          </a>
        </div>

        <div className="mt-6 card p-4">
          <p className="text-xs text-gray-500 text-center">
            <strong>Setup:</strong> Admin-Benutzer muss in Supabase Auth erstellt werden.
            Siehe <code className="text-gray-400">ADMIN_SECURITY.md</code> für Details.
          </p>
        </div>
      </div>
    </div>
  );
}
