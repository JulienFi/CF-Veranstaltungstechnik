/**
 * Rate Limiter für Login-Versuche
 *
 * Verhindert Brute-Force-Angriffe durch Begrenzung der Login-Versuche
 * pro IP-Adresse.
 *
 * WICHTIG: Dies ist eine In-Memory-Lösung für SPAs.
 * Für produktive Anwendungen sollte ein Backend-basiertes Rate-Limiting
 * mit persistentem Storage (Redis, Datenbank) verwendet werden.
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

class RateLimiter {
  private attempts: Map<string, LoginAttempt> = new Map();
  private readonly maxAttempts: number = 5;
  private readonly windowMs: number = 15 * 60 * 1000; // 15 Minuten
  private readonly cleanupInterval: number = 60 * 1000; // 1 Minute

  constructor() {
    // Automatisches Cleanup alter Einträge
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Prüft, ob eine weitere Login-Versuch erlaubt ist
   * @param identifier - Eindeutiger Identifier (z.B. Email oder IP)
   * @returns true wenn erlaubt, false wenn Limit erreicht
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return true;
    }

    // Prüfe ob das Zeitfenster abgelaufen ist
    if (now - attempt.firstAttempt > this.windowMs) {
      // Zeitfenster abgelaufen, lösche alten Eintrag
      this.attempts.delete(identifier);
      return true;
    }

    // Prüfe ob Limit erreicht
    return attempt.count < this.maxAttempts;
  }

  /**
   * Registriert einen fehlgeschlagenen Login-Versuch
   * @param identifier - Eindeutiger Identifier
   */
  recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      // Prüfe ob das Zeitfenster abgelaufen ist
      if (now - attempt.firstAttempt > this.windowMs) {
        // Neues Zeitfenster starten
        this.attempts.set(identifier, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now,
        });
      } else {
        // Zähler erhöhen
        attempt.count++;
        attempt.lastAttempt = now;
      }
    }
  }

  /**
   * Setzt die fehlgeschlagenen Versuche zurück (nach erfolgreichem Login)
   * @param identifier - Eindeutiger Identifier
   */
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Gibt die Anzahl der verbleibenden Versuche zurück
   * @param identifier - Eindeutiger Identifier
   * @returns Anzahl der verbleibenden Versuche
   */
  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return this.maxAttempts;
    }

    const now = Date.now();

    // Zeitfenster abgelaufen?
    if (now - attempt.firstAttempt > this.windowMs) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - attempt.count);
  }

  /**
   * Gibt die verbleibende Zeit bis zum Ablauf der Sperre zurück (in Sekunden)
   * @param identifier - Eindeutiger Identifier
   * @returns Verbleibende Zeit in Sekunden, oder 0 wenn nicht gesperrt
   */
  getBlockedTimeRemaining(identifier: string): number {
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return 0;
    }

    const now = Date.now();
    const elapsed = now - attempt.firstAttempt;

    if (elapsed > this.windowMs) {
      return 0;
    }

    if (attempt.count >= this.maxAttempts) {
      return Math.ceil((this.windowMs - elapsed) / 1000);
    }

    return 0;
  }

  /**
   * Entfernt abgelaufene Einträge aus dem Speicher
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.attempts.forEach((attempt, identifier) => {
      if (now - attempt.firstAttempt > this.windowMs) {
        toDelete.push(identifier);
      }
    });

    toDelete.forEach(identifier => this.attempts.delete(identifier));

    if (toDelete.length > 0) {
      console.log(`Rate Limiter: ${toDelete.length} abgelaufene Einträge entfernt`);
    }
  }

  /**
   * Gibt Statistiken über aktuelle Rate-Limits zurück
   */
  getStats(): { totalTracked: number; blocked: number } {
    const now = Date.now();
    let blocked = 0;

    this.attempts.forEach(attempt => {
      if (
        now - attempt.firstAttempt <= this.windowMs &&
        attempt.count >= this.maxAttempts
      ) {
        blocked++;
      }
    });

    return {
      totalTracked: this.attempts.size,
      blocked,
    };
  }
}

// Singleton-Instanz
export const loginRateLimiter = new RateLimiter();
