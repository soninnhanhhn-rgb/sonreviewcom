import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

// Public inbound webhook: brand server -> here -> Meta Conversions API
// URL:  https://<your-site>/api/public/conversion?secret=<WEBHOOK_SECRET>
// Method: GET (query params) or POST (JSON body). Both work.
//
// Accepted fields (any name in the list):
//   secret        - must match landing_settings.webhook_secret
//   fbclid        - raw fbclid string (or send it as the SubID param name)
//   value|revenue|payout - conversion amount (number/string)
//   currency      - ISO code, e.g. USD
//   event         - event name, default "Purchase"
//   event_id      - dedup id (recommended)
//   email, phone  - hashed automatically before sending to Meta
//   ip, user_agent, event_source_url - optional context

type AnyRec = Record<string, unknown>;

function pick(rec: AnyRec, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = rec[k];
    if (v !== undefined && v !== null && String(v).length > 0) return String(v);
  }
  return undefined;
}

function sha256(s: string) {
  return createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

async function handle(request: Request) {
  const url = new URL(request.url);

  // Merge query + body payload
  const payload: AnyRec = {};
  for (const [k, v] of url.searchParams.entries()) payload[k] = v;
  if (request.method !== "GET") {
    const ct = request.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const body = await request.json();
        if (body && typeof body === "object") Object.assign(payload, body as AnyRec);
      } else {
        const text = await request.text();
        if (text) {
          const params = new URLSearchParams(text);
          for (const [k, v] of params.entries()) payload[k] = v;
        }
      }
    } catch {
      // ignore malformed body
    }
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("landing_settings")
    .select(
      "fb_pixel_id, fb_capi_token, fb_test_event_code, subid_param, default_currency, default_value, webhook_secret",
    )
    .eq("id", 1)
    .maybeSingle();

  const secret = (row?.webhook_secret || "").trim();
  if (!secret) {
    return Response.json({ ok: false, error: "Webhook chưa được bật (thiếu webhook_secret)" }, { status: 403 });
  }
  const provided = pick(payload, ["secret", "token"]) ?? request.headers.get("x-webhook-secret") ?? "";
  if (provided !== secret) {
    return Response.json({ ok: false, error: "Sai secret" }, { status: 401 });
  }

  const pixelId = (row?.fb_pixel_id || "").trim();
  const token = (row?.fb_capi_token || "").trim();
  if (!pixelId || !token) {
    return Response.json({ ok: false, error: "Chưa cấu hình Pixel ID hoặc CAPI Access Token" }, { status: 400 });
  }

  const subidKey = (row?.subid_param || "sub1").trim();
  const fbclid =
    pick(payload, [subidKey, "fbclid", "sub1", "sub2", "click_id", "clickid", "s1"]) || "";
  const valueRaw = pick(payload, ["value", "revenue", "payout", "amount"]);
  const value = valueRaw !== undefined ? Number(valueRaw) : Number(row?.default_value ?? 0);
  const currency = (pick(payload, ["currency", "cur"]) || row?.default_currency || "USD").toUpperCase();
  const eventName = pick(payload, ["event", "event_name"]) || "Purchase";
  const eventId = pick(payload, ["event_id", "conversion_id", "order_id", "id"]);
  const email = pick(payload, ["email", "em"]);
  const phone = pick(payload, ["phone", "ph"]);
  const eventSourceUrl =
    pick(payload, ["event_source_url", "source_url", "url"]) ||
    `${url.origin}/`;
  const clientIp =
    pick(payload, ["ip", "client_ip_address"]) ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined;
  const clientUa = pick(payload, ["user_agent", "ua"]) || request.headers.get("user-agent") || undefined;

  const userData: AnyRec = {};
  if (fbclid) userData.fbc = `fb.1.${Date.now()}.${fbclid}`;
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone.replace(/\D/g, ""))];
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUa) userData.client_user_agent = clientUa;

  const capiBody: AnyRec = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: eventSourceUrl,
        ...(eventId ? { event_id: eventId } : {}),
        user_data: userData,
        custom_data: {
          currency,
          value: Number.isFinite(value) ? value : 0,
        },
      },
    ],
  };
  const testCode = (row?.fb_test_event_code || "").trim();
  if (testCode) capiBody.test_event_code = testCode;

  const endpoint = `https://graph.facebook.com/v19.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`;
  const logRow = {
    event_name: eventName,
    value: Number.isFinite(value) ? value : 0,
    currency,
    click_id: fbclid || null,
    event_id: eventId || null,
    source_ip: clientIp || null,
    request_payload: payload as never,
  };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiBody),
    });
    const respText = await res.text();
    let respJson: unknown = respText;
    try {
      respJson = JSON.parse(respText);
    } catch {
      // keep as text
    }
    if (!res.ok) {
      console.error("Meta CAPI error", res.status, respText);
      await supabaseAdmin.from("event_logs").insert({
        ...logRow,
        status: "error",
        status_code: res.status,
        meta_response: respJson as never,
        error_message: typeof respJson === "object" ? null : String(respJson).slice(0, 500),
      });
      return Response.json({ ok: false, status: res.status, response: respJson }, { status: 502 });
    }
    await supabaseAdmin.from("event_logs").insert({
      ...logRow,
      status: "ok",
      status_code: res.status,
      meta_response: respJson as never,
    });
    return Response.json({ ok: true, event: eventName, value, currency, response: respJson });
  } catch (e) {
    console.error("CAPI fetch failed", e);
    await supabaseAdmin.from("event_logs").insert({
      ...logRow,
      status: "error",
      error_message: e instanceof Error ? e.message.slice(0, 500) : "fetch failed",
    });
    return Response.json({ ok: false, error: "Không gọi được Meta CAPI" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/public/conversion")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});