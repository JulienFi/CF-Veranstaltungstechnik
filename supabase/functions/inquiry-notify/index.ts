type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  message: string;
  product_name: string;
  product_slug: string;
  source_url: string;
  utm_source: string;
  utm_campaign: string;
  created_at: string;
};

type DatabaseWebhookPayload = {
  type: string;
  table: string;
  schema: string;
  record: InquiryRecord;
};

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const DEDUP_WINDOW_MS = 120_000;
const recentInquiryKeys = new Map<string, number>();

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseRecord(raw: unknown): InquiryRecord {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: asTrimmedString(source.id),
    name: asTrimmedString(source.name),
    email: asTrimmedString(source.email),
    phone: asTrimmedString(source.phone),
    company: asTrimmedString(source.company),
    website: asTrimmedString(source.website),
    message: asTrimmedString(source.message),
    product_name: asTrimmedString(source.product_name),
    product_slug: asTrimmedString(source.product_slug),
    source_url: asTrimmedString(source.source_url),
    utm_source: asTrimmedString(source.utm_source),
    utm_campaign: asTrimmedString(source.utm_campaign),
    created_at: asTrimmedString(source.created_at),
  };
}

function parsePayload(raw: unknown): DatabaseWebhookPayload {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    type: asTrimmedString(source.type).toUpperCase(),
    table: asTrimmedString(source.table),
    schema: asTrimmedString(source.schema),
    record: parseRecord(source.record),
  };
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function short(value: string, max = 160): string {
  if (!value) {
    return "-";
  }
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function hasContact(record: InquiryRecord): boolean {
  return Boolean(record.phone || record.email);
}

function shouldIgnoreAsSpam(record: InquiryRecord): boolean {
  const honeypotFilled = Boolean(record.website || record.company);
  if (honeypotFilled) {
    return true;
  }

  const hasMeaningfulMessage = record.message.length >= 3;
  if (!hasMeaningfulMessage && !hasContact(record)) {
    return true;
  }

  return false;
}

function cleanupDedupMap(now: number): void {
  for (const [key, timestamp] of recentInquiryKeys.entries()) {
    if (now - timestamp > DEDUP_WINDOW_MS) {
      recentInquiryKeys.delete(key);
    }
  }
}

function buildDedupKey(record: InquiryRecord): string {
  const contactKey = record.phone || record.email || "-";
  const productKey = record.product_slug || record.product_name || "-";
  const sourceKey = record.source_url || "-";
  return `${contactKey.toLowerCase()}|${productKey.toLowerCase()}|${sourceKey.toLowerCase()}`;
}

function isDuplicateInWindow(dedupKey: string): boolean {
  const now = Date.now();
  cleanupDedupMap(now);

  const previousTimestamp = recentInquiryKeys.get(dedupKey);
  if (previousTimestamp && now - previousTimestamp <= DEDUP_WINDOW_MS) {
    return true;
  }

  recentInquiryKeys.set(dedupKey, now);
  return false;
}

function buildPrefix(record: InquiryRecord): string {
  if (!hasContact(record)) {
    return "⚠️";
  }

  if (record.product_name || record.phone) {
    return "🔥";
  }

  return "📩";
}

function buildMessage(record: InquiryRecord, adminUrl: string | null): string {
  const contact = [record.phone, record.email].filter(Boolean).map((value) => short(value, 80)).join(" / ") || "-";
  const productLabel = record.product_name || record.product_slug;
  const sourceUrl = record.source_url || "-";

  const lines: string[] = [
    `${buildPrefix(record)} Neue Anfrage (inquiries)`,
    `Name: ${short(record.name, 80)}`,
    `Kontakt: ${contact}`,
    `Produkt: ${short(productLabel, 120)}`,
    `Quelle: ${short(sourceUrl, 220)}`,
  ];

  if (adminUrl) {
    lines.push(`Admin: ${adminUrl}/admin/inquiries`);
  }

  if (record.utm_source || record.utm_campaign) {
    lines.push(`UTM: source=${short(record.utm_source, 60)} campaign=${short(record.utm_campaign, 60)}`);
  }

  lines.push(`Erstellt: ${short(record.created_at, 40)}`);
  return lines.slice(0, 15).join("\n");
}

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: JSON_HEADERS,
  });
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  const providedSecret = request.headers.get("x-webhook-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return unauthorized();
  }

  let parsedPayload: DatabaseWebhookPayload;
  try {
    parsedPayload = parsePayload(await request.json());
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  if (parsedPayload.type !== "INSERT" || parsedPayload.table !== "inquiries") {
    return new Response(null, { status: 204 });
  }

  if (shouldIgnoreAsSpam(parsedPayload.record)) {
    return new Response(null, { status: 204 });
  }

  const dedupKey = buildDedupKey(parsedPayload.record);
  if (isDuplicateInWindow(dedupKey)) {
    return new Response(null, { status: 204 });
  }

  const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!discordWebhookUrl) {
    return new Response(JSON.stringify({ ok: false, error: "missing_discord_webhook_url" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const adminUrlFromEnv = Deno.env.get("ADMIN_URL");
  const adminUrl = adminUrlFromEnv ? normalizeBaseUrl(adminUrlFromEnv) : null;
  const content = buildMessage(parsedPayload.record, adminUrl);

  const discordResponse = await fetch(discordWebhookUrl, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ content }),
  });

  if (!discordResponse.ok) {
    const errorBody = await discordResponse.text();
    return new Response(
      JSON.stringify({
        ok: false,
        error: "discord_request_failed",
        status: discordResponse.status,
        body: errorBody,
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
