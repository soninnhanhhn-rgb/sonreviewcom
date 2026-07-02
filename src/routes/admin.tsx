import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSettings, saveSettings, verifyAdmin } from "@/lib/settings.functions";
import { Lock, Save, Check } from "lucide-react";

export const Route = createFileRoute("/admin")({
  loader: async () => ({ settings: await getSettings() }),
  component: Admin,
  head: () => ({ meta: [{ title: "Admin — Cấu hình Pixel & Postback" }, { name: "robots", content: "noindex, nofollow" }] }),
});

function Admin() {
  const { settings } = Route.useLoaderData();
  const verify = useServerFn(verifyAdmin);
  const save = useServerFn(saveSettings);

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pixel, setPixel] = useState(settings.fb_pixel_id);
  const [head, setHead] = useState(settings.custom_head_html);
  const [body, setBody] = useState(settings.custom_body_html);
  const [postback, setPostback] = useState(settings.postback_url);
  const [affiliate, setAffiliate] = useState(settings.affiliate_url);

  const onUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await verify({ data: { password } });
    if (res.ok) setUnlocked(true);
    else setErr("Mật khẩu không đúng");
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setSaved(false);
    const res = await save({
      data: {
        password,
        fb_pixel_id: pixel,
        custom_head_html: head,
        custom_body_html: body,
        postback_url: postback,
        affiliate_url: affiliate,
      },
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErr(res.error || "Lưu thất bại");
    }
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={onUnlock} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--brand-navy)", color: "var(--primary-foreground)" }}
            >
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">Trang quản trị</div>
              <div className="text-xs text-muted-foreground">Nhập mật khẩu để tiếp tục</div>
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="Mật khẩu admin"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Mở khoá
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <form onSubmit={onSave} className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cấu hình Landing</h1>
            <p className="text-sm text-muted-foreground">
              FB Pixel, custom scripts, Postback URL và link brand.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Đã lưu" : saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </header>

        {err && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
            {err}
          </div>
        )}

        <Field label="Facebook Pixel ID" hint="Chỉ nhập số ID (VD: 1234567890). Pixel được auto inject + tự động fire PageView.">
          <input
            value={pixel}
            onChange={(e) => setPixel(e.target.value)}
            placeholder="1234567890123456"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-mono outline-none focus:border-primary"
          />
        </Field>

        <Field label="Link brand (affiliate URL)" hint="URL mở khi user bấm 'Lấy mã'. Tham số ?promo=CODE sẽ tự thêm vào.">
          <input
            value={affiliate}
            onChange={(e) => setAffiliate(e.target.value)}
            placeholder="https://jobcopilot.com/?ref=your-id"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field
          label="Postback URL (Server-to-Server)"
          hint="URL brand cung cấp. Được gọi từ server khi user bấm CTA. Hỗ trợ biến {code}, {event}, {ts}."
        >
          <input
            value={postback}
            onChange={(e) => setPostback(e.target.value)}
            placeholder="https://brand.com/postback?code={code}&event={event}&ts={ts}"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field
          label="Custom HTML — trong <head>"
          hint="Dán script bổ sung (Meta CAPI helper, GA4, TikTok Pixel, GTM...). HTML thô, tự chịu trách nhiệm."
        >
          <textarea
            value={head}
            onChange={(e) => setHead(e.target.value)}
            rows={8}
            placeholder="<script>...</script>"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-mono text-xs outline-none focus:border-primary"
          />
        </Field>

        <Field label="Custom HTML — cuối <body>" hint="Noscript, iframe tracking, chat widget...">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="<noscript>...</noscript>"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-mono text-xs outline-none focus:border-primary"
          />
        </Field>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <label className="text-sm font-semibold">{label}</label>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}