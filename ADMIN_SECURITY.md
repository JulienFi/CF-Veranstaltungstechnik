# Admin-Security Dokumentation

## Übersicht

Das Admin-Login-System von CF Veranstaltungstechnik nutzt **Supabase Auth** mit zusätzlichen Sicherheitsmaßnahmen:

✅ **Supabase Auth** - Enterprise-Grade JWT-basierte Authentifizierung
✅ **Rate Limiting** - Schutz gegen Brute-Force-Angriffe
✅ **Admin-Email-Validierung** - Nur konfigurierte Admin-Email erhält Zugang
✅ **Route Guards** - Automatische Umleitung bei fehlender Berechtigung
✅ **Session Management** - Sichere, HttpOnly Cookies (von Supabase verwaltet)

## Sicherheitsfeatures

### 1. Supabase Auth (JWT-basiert)

**Warum Supabase Auth?**
- ✅ Enterprise-Grade-Sicherheit
- ✅ JWT-Tokens in HttpOnly Cookies (nicht von JavaScript zugreifbar)
- ✅ Automatische Token-Rotation
- ✅ Secure: true (nur über HTTPS)
- ✅ SameSite: 'lax' (CSRF-Schutz)
- ✅ Passwort-Hashing mit bcrypt (von Supabase)

**Konfiguration:**
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_EMAIL=admin@cf-veranstaltungstechnik.de
```

### 2. Rate Limiting

**Schutz gegen Brute-Force:**
- Max. **5 fehlgeschlagene Versuche** pro Email
- Zeitfenster: **15 Minuten**
- Bei Überschreitung: Login gesperrt
- Automatisches Cleanup abgelaufener Einträge

**Implementierung:**
```typescript
// src/lib/rateLimiter.ts
export const loginRateLimiter = new RateLimiter();

// Prüfung vor Login
if (!loginRateLimiter.checkLimit(email)) {
  // Gesperrt
}

// Nach fehlgeschlagenem Login
loginRateLimiter.recordFailedAttempt(email);

// Nach erfolgreichem Login
loginRateLimiter.resetAttempts(email);
```

**Feedback für User:**
- Anzahl verbleibender Versuche
- Verbleibende Sperrzeit in Minuten/Sekunden
- Generische Fehlermeldungen (keine Details über Email/Passwort)

### 3. Admin-Email-Validierung

Nur die in `VITE_ADMIN_EMAIL` konfigurierte Email erhält Admin-Zugang:

```typescript
// src/contexts/AuthContext.tsx
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

if (data.user?.email?.toLowerCase() !== adminEmail.toLowerCase()) {
  await supabase.auth.signOut();
  throw new Error('E-Mail oder Passwort ist ungültig.');
}
```

**Vorteile:**
- Selbst mit gültigen Supabase-Credentials: Kein Zugang ohne Admin-Email
- Zentrale Konfiguration über ENV
- Einfacher Wechsel des Admin-Users

### 4. Route Guards

**AdminGuard-Komponente** schützt alle Admin-Routen:

```typescript
// src/components/AdminGuard.tsx
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      window.location.href = '/admin/login';
    }
  }, [user, loading, isAdmin]);

  // Loading State, dann Children oder null
}
```

**Geschützte Routen:**
- `/admin` - Dashboard
- `/admin/products` - Produktverwaltung
- `/admin/projects` - Projektverwaltung
- `/admin/team` - Teamverwaltung

**Öffentliche Route:**
- `/admin/login` - Login-Seite (ungeschützt)

### 5. Session Management

**Supabase verwaltet Sessions automatisch:**
- JWT-Token in HttpOnly Cookie
- Automatische Token-Refresh
- Session-Validierung bei jeder Anfrage
- Logout löscht Token und Session

```typescript
// Login
const { error } = await supabase.auth.signInWithPassword({ email, password });

// Logout
await supabase.auth.signOut();

// Session-Check
const { data: { session } } = await supabase.auth.getSession();
```

## Setup: Admin-User erstellen

### Option 1: Supabase Dashboard (Empfohlen)

1. **Supabase Dashboard öffnen:**
   - Gehe zu https://supabase.com/dashboard
   - Wähle dein Projekt

2. **Authentication → Users:**
   - Klicke "Add user"
   - Email: `admin@cf-veranstaltungstechnik.de`
   - Passwort: **Sicheres Passwort wählen!**
   - Auto Confirm User: ✅ aktivieren

3. **ENV konfigurieren:**
   ```env
   VITE_ADMIN_EMAIL=admin@cf-veranstaltungstechnik.de
   ```

4. **Testen:**
   - Öffne `/admin/login`
   - Login mit den erstellten Credentials

### Option 2: Supabase SQL Editor

```sql
-- Admin-User in auth.users erstellen
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  'admin@cf-veranstaltungstechnik.de',
  crypt('IhrSicheresPasswort', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);
```

**Wichtig**: Ersetze `IhrSicheresPasswort` durch ein starkes Passwort!

### Option 3: Supabase CLI

```bash
# Supabase CLI installieren
npm install -g supabase

# Login
supabase login

# User erstellen
supabase auth create-user --email admin@cf-veranstaltungstechnik.de
```

## Passwort-Anforderungen

**Empfohlene Anforderungen:**
- ✅ Mindestens 12 Zeichen
- ✅ Groß- und Kleinbuchstaben
- ✅ Zahlen
- ✅ Sonderzeichen
- ✅ Keine Wörter aus Wörterbüchern
- ✅ Passwort-Manager nutzen

**Beispiel für sicheres Passwort:**
```
Cf2024!VtMbL#SecAdm$
```

## Sicherheitsempfehlungen

### Für Produktivbetrieb

#### ✅ MUSS implementiert werden:

1. **HTTPS erzwingen**
   ```javascript
   // In Supabase Dashboard: Settings → API
   // "Enforce HTTPS" aktivieren
   ```

2. **Starkes Admin-Passwort**
   - Min. 12 Zeichen
   - Passwort-Manager verwenden
   - Regelmäßig ändern (alle 3-6 Monate)

3. **ENV-Variablen sicher verwalten**
   ```bash
   # .env NIEMALS committen!
   # Bereits in .gitignore
   .env
   ```

4. **Admin-Email regelmäßig prüfen**
   ```bash
   # Supabase Dashboard → Authentication → Users
   # Unbekannte User entfernen
   ```

#### 🔒 SOLLTE implementiert werden:

5. **IP-Whitelisting (Optional)**
   ```javascript
   // Supabase Dashboard → Settings → API
   // IP restrictions konfigurieren
   ```

6. **Logging fehlgeschlagener Logins**
   ```typescript
   // In AuthContext.tsx erweitern:
   console.error('Failed login attempt:', {
     email,
     timestamp: new Date(),
     ip: '...' // Benötigt Backend
   });
   ```

7. **2FA / MFA (Zukünftig)**
   ```typescript
   // Supabase unterstützt MFA:
   await supabase.auth.mfa.enroll({ factorType: 'totp' });
   ```

8. **Session Timeout**
   ```typescript
   // Supabase Auth Session-Timeout konfigurieren
   // Dashboard → Authentication → Settings
   // JWT expiry: 1 hour (Standard)
   ```

#### 📊 KANN implementiert werden:

9. **Audit Logging**
   - Log alle Admin-Aktionen
   - Timestamp, User, Aktion
   - Speicherung in Datenbank

10. **CAPTCHA für Login**
    ```typescript
    // Google reCAPTCHA v3 oder hCaptcha
    // Bei mehrfachen fehlgeschlagenen Logins
    ```

11. **Email-Benachrichtigungen**
    - Bei erfolgreichen Logins
    - Bei fehlgeschlagenen Logins
    - Bei Passwort-Änderungen

12. **Backup-Admin-User**
    - Zweiter Admin-Account
    - Für Notfälle
    - In ENV: `VITE_BACKUP_ADMIN_EMAIL`

## Fehlermeldungen

### Für den User (Generisch)

❌ **Falsch:**
```
"Email nicht gefunden"
"Passwort ist falsch"
```

✅ **Richtig:**
```
"E-Mail oder Passwort ist ungültig."
```

**Warum?**
- Keine Informationen, ob Email existiert
- Schutz gegen Email-Enumeration
- Erschwert Brute-Force

### Interne Logs (Details)

```typescript
console.error('Login failed:', {
  email: 'admin@...', // Gekürzt
  reason: 'invalid_password',
  attempts: 3,
  timestamp: new Date()
});
```

## Testing

### Manuelle Tests

```bash
# 1. Erfolgreicher Login
Email: admin@cf-veranstaltungstechnik.de
Passwort: [Korrektes Passwort]
Erwartung: Redirect zu /admin

# 2. Falsches Passwort
Email: admin@cf-veranstaltungstechnik.de
Passwort: falsch
Erwartung: Fehlermeldung + Verbleibende Versuche

# 3. Rate Limiting
- 5x falsches Passwort eingeben
Erwartung: Login gesperrt für 15 Minuten

# 4. Nicht-Admin-User
Email: user@example.com
Passwort: [Beliebig]
Erwartung: "E-Mail oder Passwort ist ungültig."

# 5. Geschützte Route ohne Login
URL: /admin
Erwartung: Redirect zu /admin/login
```

### Automatisierte Tests (TODO)

```typescript
// tests/auth.test.ts
describe('Admin Login', () => {
  it('should block after 5 failed attempts', async () => {
    // 5 mal falsches Passwort
    // Prüfe: Login gesperrt
  });

  it('should only allow admin email', async () => {
    // Login mit nicht-Admin-Email
    // Prüfe: Zugriff verweigert
  });
});
```

## Troubleshooting

### Problem: Login funktioniert nicht

**1. Admin-User existiert?**
```sql
-- In Supabase SQL Editor
SELECT email, created_at FROM auth.users WHERE email = 'admin@cf-veranstaltungstechnik.de';
```

**2. ENV korrekt?**
```bash
cat .env | grep ADMIN_EMAIL
# Sollte anzeigen: VITE_ADMIN_EMAIL=admin@cf-veranstaltungstechnik.de
```

**3. Rate Limiting?**
- Warte 15 Minuten
- Oder: Browser Cache/Cookies löschen

**4. Supabase erreichbar?**
```bash
curl https://mednhkpchhuuwqbloqnb.supabase.co/auth/v1/health
# Sollte antworten: {"status":"ok"}
```

### Problem: "Too many requests"

**Lösung:**
- Warte 15 Minuten
- Rate Limiter wird automatisch zurückgesetzt

**Für Entwicklung:**
```typescript
// In src/lib/rateLimiter.ts (temporär):
private readonly maxAttempts: number = 100; // Statt 5
```

### Problem: Session abgelaufen

**Lösung:**
- Erneut einloggen
- Supabase JWT läuft nach 1 Stunde ab (Standard)

**Konfiguration anpassen:**
```
Supabase Dashboard → Authentication → Settings
JWT expiry: 3600 (1 hour) → 7200 (2 hours)
```

## Datenschutz

**DSGVO-Konformität:**
- ✅ Login-Daten nur in Supabase
- ✅ Rate-Limiter In-Memory (keine Persistierung)
- ✅ Keine Tracking-Cookies
- ✅ Passwort-Hashing (bcrypt)

**Datenspeicherung:**
```
Rate Limiter (In-Memory):
- Email (gehashed)
- Anzahl Versuche
- Zeitstempel

Supabase (Persistent):
- Email
- Passwort-Hash
- Session-Token (JWT)
```

## Support & Wartung

**Regelmäßige Aufgaben:**
- [ ] Admin-Passwort alle 3-6 Monate ändern
- [ ] Supabase-Logs prüfen (monatlich)
- [ ] Unbekannte User in Supabase entfernen
- [ ] Security-Updates von Supabase beachten

**Bei Sicherheitsvorfällen:**
1. Admin-Passwort sofort ändern
2. Alle Sessions invalidieren (Supabase Dashboard)
3. Logs prüfen
4. Gegebenenfalls 2FA aktivieren

## Kontakt

Bei Fragen zur Admin-Security:
- Code: `src/contexts/AuthContext.tsx`
- Rate Limiter: `src/lib/rateLimiter.ts`
- Login Page: `src/pages/admin/LoginPage.tsx`
- Route Guard: `src/components/AdminGuard.tsx`
- Diese Dokumentation: `ADMIN_SECURITY.md`

---

**Stand**: Admin-Login mit Supabase Auth, Rate Limiting und Route Guards implementiert ✅
