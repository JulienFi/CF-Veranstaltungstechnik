# Webhooks: Inquiry -> Discord

Diese Anleitung richtet einen Alert ein, der bei **INSERT** in `inquiries` automatisch eine Discord-Nachricht sendet.

## 1) Supabase Edge Function deployen

1. Stelle sicher, dass die Function im Repo liegt:
   - `supabase/functions/inquiry-notify/index.ts`
2. Deploye die Function:
   - `supabase functions deploy inquiry-notify`

## 2) Environment Variablen setzen (Supabase)

Setze in Supabase fuer die Function diese Variablen:

- `DISCORD_WEBHOOK_URL`
- `WEBHOOK_SECRET`
- `ADMIN_URL` (optional, z. B. `https://www.cf-veranstaltungstechnik.berlin`)

Beispiel CLI:

```bash
supabase secrets set DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." WEBHOOK_SECRET="ein-langes-zufaelliges-secret" ADMIN_URL="https://www.cf-veranstaltungstechnik.berlin"
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
2. Pruefen, dass in Discord eine Nachricht eingeht.

### Variante B: Lokal gegen lokale Function

Voraussetzung: Supabase lokal inkl. Functions laeuft (`supabase start` + `supabase functions serve inquiry-notify`).

Dann:

```bash
npm run test:webhook
```

Das Skript sendet einen Test-Payload an:

- Standard: `http://localhost:54321/functions/v1/inquiry-notify`
- Header: `x-webhook-secret` mit `WEBHOOK_SECRET`

Optional per Env ueberschreiben:

- `WEBHOOK_FUNCTION_URL`
- `WEBHOOK_SECRET`

## 5) Erwartetes Verhalten

- Ungueltiges/missing Secret -> `401`
- Event ungleich `INSERT` oder Tabelle ungleich `inquiries` -> `204`
- Spam-Guard -> `204` (falls Honeypot-Feld `website` oder `company` gefuellt ist)
- Spam-Guard -> `204` (falls Nachricht kuerzer als 3 Zeichen und kein Telefon/E-Mail vorhanden)
- Dedup-Guard -> `204` (gleicher Schluessel aus `phone||email`, `product_slug||product_name`, `source_url` innerhalb von 120 Sekunden)
- Gueltiger Inquiry-Insert -> Discord-POST und `200 {"ok":true}`

Bei gesetztem `ADMIN_URL` enthaelt die Discord-Nachricht zusaetzlich einen direkten Admin-Link:

- `Admin: <ADMIN_URL>/admin/inquiries`

## 6) Sicherheit

- Keine Secrets in Git committen.
- `WEBHOOK_SECRET` lang und zufaellig waehlen.
- Secret in Webhook Header und Function Env identisch halten.
