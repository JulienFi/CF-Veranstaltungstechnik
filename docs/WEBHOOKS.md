# Webhooks: Inquiry -> Resend E-Mail

Diese Anleitung richtet einen Flow ein, der bei **INSERT** in `inquiries` automatisch eine E-Mail an das Admin-Postfach versendet.

## 1) Supabase Edge Function deployen

1. Stelle sicher, dass die Function im Repo liegt:
   - `supabase/functions/inquiry-notify/index.ts`
2. Deploye die Function:
   - `supabase functions deploy inquiry-notify`

## 2) Environment-Variablen setzen (Supabase)

Setze in Supabase für die Function diese Variablen:

- `WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

Beispiel CLI:

```bash
supabase secrets set WEBHOOK_SECRET="ein-langes-zufaelliges-secret" RESEND_API_KEY="re_xxx" ADMIN_EMAIL="admin@your-domain.tld"
```

## 3) Database Webhook im Dashboard anlegen

Pfad im Dashboard:

1. **Supabase Dashboard** -> **Database** -> **Webhooks**
2. **New webhook**
3. Konfiguration:
   - **Table**: `inquiries`
   - **Events**: `INSERT`
   - **URL**: `https://<project-ref>.functions.supabase.co/inquiry-notify`
   - **Headers**:
     - `x-webhook-secret: <gleiches Secret wie WEBHOOK_SECRET>`

## 4) Testen

### Variante A: End-to-End in der App

1. In der UI eine neue Anfrage erstellen (`/mietshop/anfrage`).
2. Prüfen, dass eine E-Mail im Admin-Postfach eingeht.

### Variante B: Lokal gegen lokale Function

Voraussetzung: Supabase lokal inkl. Functions läuft (`supabase start` + `supabase functions serve inquiry-notify`).

Dann:

```bash
npm run test:webhook
```

Das Skript sendet einen Test-Payload an:

- Standard: `http://localhost:54321/functions/v1/inquiry-notify`
- Header: `x-webhook-secret` mit `WEBHOOK_SECRET`

Optional per Env überschreiben:

- `WEBHOOK_FUNCTION_URL`
- `WEBHOOK_SECRET`

## 5) Erwartetes Verhalten

- Ungültiges/missing Secret -> `401`
- Event ungleich `INSERT` oder Tabelle ungleich `inquiries` -> `204`
- Spam-Guard -> `204` (falls Honeypot-Feld `website` oder `company` gefüllt ist)
- Spam-Guard -> `204` (falls Nachricht kürzer als 3 Zeichen und kein Telefon/E-Mail vorhanden)
- Dedup-Guard -> `204` (gleicher Schlüssel aus `phone||email`, `product_slug||product_name`, `source_url` innerhalb von 120 Sekunden)
- Gültiger Inquiry-Insert -> Resend-API-POST und `200 {"ok":true}`

## 6) Sicherheit

- Keine Secrets in Git committen.
- `WEBHOOK_SECRET` lang und zufällig wählen.
- Secret in Webhook-Header und Function-Env identisch halten.
- `RESEND_API_KEY` ausschließlich als Function Secret speichern.
