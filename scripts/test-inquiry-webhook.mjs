const functionUrl =
  process.env.WEBHOOK_FUNCTION_URL ||
  'http://localhost:54321/functions/v1/inquiry-notify';

const webhookSecret = process.env.WEBHOOK_SECRET || 'dev-webhook-secret';

const payload = {
  type: 'INSERT',
  table: 'inquiries',
  schema: 'public',
  record: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Max Mustermann',
    email: 'max@example.com',
    phone: '+49 170 1234567',
    product_name: 'LED Moving Head Set',
    source_url: 'https://www.cf-veranstaltungstechnik.berlin/mietshop/anfrage?product=led-moving-head',
    utm_source: 'google',
    utm_campaign: 'fruehjahr',
    created_at: new Date().toISOString(),
  },
};

async function run() {
  console.log(`[webhook-test] POST ${functionUrl}`);
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-secret': webhookSecret,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log(`[webhook-test] status=${response.status}`);
  console.log(`[webhook-test] body=${body}`);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('[webhook-test] failed:', error);
  process.exitCode = 1;
});
