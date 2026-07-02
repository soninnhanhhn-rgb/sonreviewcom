import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LandingSettings = {
  fb_pixel_id: string;
  custom_head_html: string;
  custom_body_html: string;
  postback_url: string;
  postback_method: "GET" | "POST";
  postback_body: string;
  affiliate_url: string;
  fb_capi_token: string;
  fb_test_event_code: string;
  subid_param: string;
  default_currency: string;
  default_value: number;
  webhook_secret: string;
};

const DEFAULTS: LandingSettings = {
  fb_pixel_id: "",
  custom_head_html: "",
  custom_body_html: "",
  postback_url: "",
  postback_method: "GET",
  postback_body: "",
  affiliate_url: "https://jobcopilot.com/",
  fb_capi_token: "",
  fb_test_event_code: "",
  subid_param: "sub1",
  default_currency: "USD",
  default_value: 0,
  webhook_secret: "",
};

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("landing_settings")
    .select("fb_pixel_id, custom_head_html, custom_body_html, postback_url, postback_method, postback_body, affiliate_url, fb_capi_token, fb_test_event_code, subid_param, default_currency, default_value, webhook_secret")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error(error);
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...(data ?? {}) } as LandingSettings;
});

const saveSchema = z.object({
  password: z.string().min(1),
  fb_pixel_id: z.string().max(64).default(""),
  custom_head_html: z.string().max(20000).default(""),
  custom_body_html: z.string().max(20000).default(""),
  postback_url: z.string().max(2000).default(""),
  postback_method: z.enum(["GET", "POST"]).default("GET"),
  postback_body: z.string().max(20000).default(""),
  affiliate_url: z.string().max(2000).default(""),
  fb_capi_token: z.string().max(2000).default(""),
  fb_test_event_code: z.string().max(64).default(""),
  subid_param: z.string().max(32).default("sub1"),
  default_currency: z.string().max(8).default("USD"),
  default_value: z.coerce.number().min(0).default(0),
  webhook_secret: z.string().max(200).default(""),
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || data.password !== expected) {
      return { ok: false as const, error: "Sai mật khẩu" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("landing_settings")
      .upsert({
        id: 1,
        fb_pixel_id: data.fb_pixel_id,
        custom_head_html: data.custom_head_html,
        custom_body_html: data.custom_body_html,
        postback_url: data.postback_url,
        postback_method: data.postback_method,
        postback_body: data.postback_body,
        affiliate_url: data.affiliate_url,
        fb_capi_token: data.fb_capi_token,
        fb_test_event_code: data.fb_test_event_code,
        subid_param: data.subid_param,
        default_currency: data.default_currency,
        default_value: data.default_value,
        webhook_secret: data.webhook_secret,
        updated_at: new Date().toISOString(),
      });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

const verifySchema = z.object({ password: z.string().min(1) });
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    return { ok: data.password === process.env.ADMIN_PASSWORD };
  });

const postbackSchema = z.object({
  code: z.string().max(64),
  event: z.string().max(32).default("Lead"),
});
export const firePostback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => postbackSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("landing_settings")
      .select("postback_url, postback_method, postback_body")
      .eq("id", 1)
      .maybeSingle();
    const url = row?.postback_url?.trim();
    if (!url) return { ok: true as const, skipped: true };
    const method = (row?.postback_method || "GET").toUpperCase();
    const bodyTpl = row?.postback_body || "";
    try {
      const replace = (s: string, encode: boolean) =>
        s
          .replace(/\{code\}/g, encode ? encodeURIComponent(data.code) : data.code)
          .replace(/\{event\}/g, encode ? encodeURIComponent(data.event) : data.event)
          .replace(/\{conversionType\}/g, encode ? encodeURIComponent(data.event) : data.event)
          .replace(/\{ts\}/g, String(Date.now()));
      const finalUrl = replace(url, true);
      if (method === "POST") {
        const finalBody = bodyTpl ? replace(bodyTpl, false) : "";
        await fetch(finalUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: finalBody,
        });
      } else {
        await fetch(finalUrl, { method: "GET" });
      }
      return { ok: true as const };
    } catch (e) {
      console.error("postback failed", e);
      return { ok: false as const };
    }
  });