type InquiryRecord = {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  event_type: string;
  event_date: string;
  start_date: string;
  end_date: string;
  guest_count: string;
  handover_type: string;
  message: string;
  product_name: string;
  product_slug: string;
  source_url: string;
  created_at: string;
};

type DatabaseWebhookPayload = {
  type: string;
  table: string;
  schema: string;
  record: InquiryRecord;
};

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const RESEND_API_URL = "https://api.resend.com/emails";
const DEDUP_WINDOW_MS = 120_000;
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const recentInquiryKeys = new Map<string, number>();

function asTrimmedString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function parseRecord(raw: unknown): InquiryRecord {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: asTrimmedString(source.id),
    inquiry_type: asTrimmedString(source.inquiry_type),
    name: asTrimmedString(source.name),
    email: asTrimmedString(source.email),
    phone: asTrimmedString(source.phone),
    company: asTrimmedString(source.company),
    website: asTrimmedString(source.website),
    event_type: asTrimmedString(source.event_type),
    event_date: asTrimmedString(source.event_date),
    start_date: asTrimmedString(source.start_date),
    end_date: asTrimmedString(source.end_date),
    guest_count: asTrimmedString(source.guest_count),
    handover_type: asTrimmedString(source.handover_type),
    message: asTrimmedString(source.message),
    product_name: asTrimmedString(source.product_name),
    product_slug: asTrimmedString(source.product_slug),
    source_url: asTrimmedString(source.source_url),
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateRange(record: InquiryRecord): string {
  if (record.start_date && record.end_date) {
    return `${record.start_date} bis ${record.end_date}`;
  }
  if (record.start_date) {
    return record.start_date;
  }
  if (record.end_date) {
    return record.end_date;
  }
  if (record.event_date) {
    return record.event_date;
  }
  return "-";
}

function buildHtmlBody(record: InquiryRecord): string {
  const rows: Array<[string, string]> = [
    ["Name", record.name],
    ["E-Mail", record.email],
    ["Telefon", record.phone],
    ["Event-Typ", record.event_type],
    ["Zeitraum", formatDateRange(record)],
    ["Gaestezahl", record.guest_count],
    ["Uebergabeart", record.handover_type],
    ["Nachricht", record.message],
    ["Inquiry-Typ", record.inquiry_type],
    ["Produkt", record.product_name || record.product_slug],
    ["Quelle", record.source_url],
    ["Erstellt", record.created_at],
  ];

  const rowsHtml = rows
    .map(([label, value]) => {
      return `<tr>
        <td style="padding:8px 12px;border:1px solid #d9e1ec;background:#f4f7fb;font-weight:600;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border:1px solid #d9e1ec;">${escapeHtml(short(value, 1200)) || "-"}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:Arial,sans-serif;background:#f2f5f9;color:#0f172a;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d9e1ec;border-radius:10px;overflow:hidden;">
      <div style="padding:16px 20px;background:#0f172a;color:#ffffff;">
        <h2 style="margin:0;font-size:20px;line-height:1.3;">Neue Miet-Anfrage</h2>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 14px;font-size:14px;line-height:1.5;">
          Es wurde eine neue Anfrage uebermittelt. Details:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
          ${rowsHtml}
        </table>
      </div>
    </div>
  </body>
</html>`;
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

  const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!resendApiKey) {
    return new Response(JSON.stringify({ ok: false, error: "missing_resend_api_key" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const adminEmail = Deno.env.get("ADMIN_EMAIL")?.trim() || DEFAULT_ADMIN_EMAIL;
  const senderName = "System";
  const senderEmail = "onboarding@resend.dev";
  const subjectName = parsedPayload.record.name || "Unbekannt";
  const subject = `Neue Miet-Anfrage: ${subjectName}`;
  const html = buildHtmlBody(parsedPayload.record);

  let resendResponse: Response;
  try {
    resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [adminEmail],
        subject,
        html,
      }),
    });
  } catch (error) {
    console.error("Resend request failed:", error);
    return new Response(JSON.stringify({ ok: false, error: "resend_request_failed" }), {
      status: 502,
      headers: JSON_HEADERS,
    });
  }

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    console.error("Resend API error:", {
      status: resendResponse.status,
      body: errorBody,
    });
    return new Response(
      JSON.stringify({
        ok: false,
        error: "resend_api_error",
        status: resendResponse.status,
        body: errorBody,
      }),
      {
        status: 502,
        headers: JSON_HEADERS,
      }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
