import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Lock,
  Save,
  Check,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Copy,
  Link as LinkIcon,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  Send,
} from "lucide-react";
import {
  getSettings,
  saveSettings,
  verifyAdmin,
  getOverviewStats,
  listEventLogs,
  sendTestEvent,
} from "@/lib/settings.functions";

export const Route = createFileRoute("/admin")({
  loader: async () => ({ settings: await getSettings() }),
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — JobCopilot Promo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const TABS = [
  "Overview",
  "Attribution",
  "Reviews",
  "Landing Pages",
  "Prompts",
  "A/B Testing",
  "SEO Topics",
  "Leads",
  "Conversions",
  "Revenue",
  "FB CAPI",
  "Settings",
] as const;
type Tab = (typeof TABS)[number];

function Admin() {
  const { settings } = Route.useLoaderData();
  const verify = useServerFn(verifyAdmin);

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");

  const onUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await verify({ data: { password } });
    if (res.ok) setUnlocked(true);
    else setErr("Wrong password");
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <form
          onSubmit={onUnlock}
          className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mb-6">Enter password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900"
          />
          {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
          <button
            type="submit"
            className="mt-4 w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="font-semibold text-slate-900">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 h-9 inline-flex items-center gap-1.5 rounded-lg hover:bg-slate-100"
            >
              <ExternalLink className="w-4 h-4" /> Landing Page
            </Link>
            <button
              onClick={() => setUnlocked(false)}
              className="text-sm px-3 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "h-9 px-4 rounded-full text-sm font-medium transition border " +
                  (tab === t
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {tab === "Overview" && <OverviewTab password={password} />}
        {tab === "FB CAPI" && <FbCapiTab password={password} settings={settings} />}
        {tab === "Settings" && <SettingsTab password={password} settings={settings} />}
        {tab !== "Overview" && tab !== "FB CAPI" && tab !== "Settings" && (
          <ComingSoon name={tab} />
        )}
      </main>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
      <p className="text-sm text-slate-500 mt-2">This module is coming soon.</p>
    </div>
  );
}

/* ===================== Overview ===================== */

type Stats = Awaited<ReturnType<typeof getOverviewStats>>;

function OverviewTab({ password }: { password: string }) {
  const fetchStats = useServerFn(getOverviewStats);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const s = await fetchStats({ data: { password } });
    setStats(s);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const kpi = stats?.kpis;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-500">Last 30 days performance</p>
        </div>
        <button
          onClick={load}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
        >
          <RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Leads" value={kpi?.totalLeads ?? 0} icon={<Users className="w-5 h-5" />} tone="indigo" />
        <KpiCard label="Active" value={kpi?.active ?? 0} icon={<CheckCircle2 className="w-5 h-5" />} tone="emerald" />
        <KpiCard label="Purchase" value={kpi?.purchase ?? 0} icon={<TrendingUp className="w-5 h-5" />} tone="orange" />
        <KpiCard label="Revenue" value={`$${(kpi?.revenue ?? 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} tone="amber" />
      </div>

      {/* Bar + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Leads by day (30 days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Status distribution</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.status ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {(stats?.status ?? []).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center border-t border-slate-100 pt-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Conversion rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.conversionRate ?? 0}%</div>
          </div>
        </div>
      </div>

      {/* Revenue trend */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Revenue trend</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  orange: "bg-orange-100 text-orange-600",
  amber: "bg-amber-100 text-amber-600",
};
function KpiCard({ label, value, icon, tone }: { label: string; value: number | string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + TONES[tone]}>
          {icon}
        </div>
        <span className="text-xs text-slate-400">30d</span>
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

/* ===================== FB CAPI ===================== */

const CAPI_SUB = ["Postback URLs", "Event Logs", "Test Event", "Config", "Guide"] as const;
type CapiSub = (typeof CAPI_SUB)[number];

function FbCapiTab({ password, settings }: { password: string; settings: Awaited<ReturnType<typeof getSettings>> }) {
  const [sub, setSub] = useState<CapiSub>("Postback URLs");

  return (
    <div className="space-y-5">
      {/* Info alert */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <strong>Facebook Conversions API (CAPI).</strong> Postback data is saved to the database
        and forwarded to Facebook CAPI. Configure Pixel ID, Access Token and Test Event Code in
        the Config tab.
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-2 flex-wrap">
        {CAPI_SUB.map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={
              "h-9 px-4 rounded-lg text-sm font-medium border transition inline-flex items-center gap-1.5 " +
              (sub === s
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")
            }
          >
            {s === "Postback URLs" && <LinkIcon className="w-4 h-4" />}
            {s}
          </button>
        ))}
      </div>

      {sub === "Postback URLs" && <PostbackUrlsPanel settings={settings} />}
      {sub === "Event Logs" && <EventLogsPanel password={password} />}
      {sub === "Test Event" && <TestEventPanel password={password} />}
      {sub === "Config" && <ConfigPanel password={password} settings={settings} />}
      {sub === "Guide" && <GuidePanel />}
    </div>
  );
}

function PostbackUrlsPanel({ settings }: { settings: Awaited<ReturnType<typeof getSettings>> }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const secret = settings.webhook_secret || "YOUR_SECRET";

  const signUpUrl = `${origin}/api/public/conversion?secret=${secret}&event=CompleteRegistration&click_id={click_id}&value={Payout}&currency=USD`;
  const purchaseUrl = `${origin}/api/public/conversion?secret=${secret}&event=Purchase&click_id={click_id}&value={Amount}&currency=USD&event_id={order_id}`;

  return (
    <div className="space-y-4">
      <PostbackCard
        icon={<LinkIcon className="w-5 h-5 text-indigo-600" />}
        title="Sign Up Postback URL"
        description="Sends CompleteRegistration event to Facebook"
        eventTag="CompleteRegistration"
        url={signUpUrl}
      />
      <PostbackCard
        icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
        title="Purchase Postback URL"
        description="Sends Purchase event to Facebook"
        eventTag="Purchase"
        url={purchaseUrl}
      />
    </div>
  );
}

function PostbackCard({
  icon, title, description, eventTag, url,
}: { icon: React.ReactNode; title: string; description: string; eventTag: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 relative">
        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 pr-14 text-xs text-slate-800 font-mono overflow-x-auto whitespace-pre">
{url}
        </pre>
        <button
          onClick={doCopy}
          className="absolute top-2.5 right-2.5 h-8 px-3 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 inline-flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3">
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
          FB Event: {eventTag}
        </span>
      </div>
    </div>
  );
}

type LogRow = {
  id: string;
  created_at: string;
  event_name: string;
  status: string;
  status_code: number | null;
  value: number;
  currency: string;
  click_id: string | null;
  event_id: string | null;
  source_ip: string | null;
  error_message: string | null;
};

function EventLogsPanel({ password }: { password: string }) {
  const list = useServerFn(listEventLogs);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const r = await list({ data: { password, limit: 100 } });
    setLogs((r.logs ?? []) as LogRow[]);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Event Logs</h3>
          <p className="text-sm text-slate-500">Last 100 events sent to Meta CAPI</p>
        </div>
        <button onClick={load} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5">
          <RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Time</th>
              <th className="text-left px-5 py-3 font-medium">Event</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Value</th>
              <th className="text-left px-5 py-3 font-medium">Click ID</th>
              <th className="text-left px-5 py-3 font-medium">Event ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No events yet.</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{l.event_name}</td>
                <td className="px-5 py-3">
                  <span className={"inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium border " +
                    (l.status === "ok"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-700 border-red-100")}>
                    {l.status === "ok" ? "OK" : "Error"}{l.status_code ? ` · ${l.status_code}` : ""}
                  </span>
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-900">{l.value.toFixed(2)} {l.currency}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500 truncate max-w-[180px]">{l.click_id || "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500 truncate max-w-[180px]">{l.event_id || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TestEventPanel({ password }: { password: string }) {
  const send = useServerFn(sendTestEvent);
  const [event, setEvent] = useState("Purchase");
  const [value, setValue] = useState("9.99");
  const [currency, setCurrency] = useState("USD");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult("");
    const r = await send({ data: { password, event_name: event, value: Number(value), currency, email } });
    setResult(JSON.stringify(r, null, 2));
    setBusy(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Send a test event</h3>
          <p className="text-sm text-slate-500">Fires a synthetic event to Meta CAPI (use Test Event Code to see it in Events Manager).</p>
        </div>
        <Field label="Event name">
          <select value={event} onChange={(e) => setEvent(e.target.value)} className="input">
            <option>Purchase</option>
            <option>CompleteRegistration</option>
            <option>Lead</option>
            <option>ViewContent</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Value">
            <input value={value} onChange={(e) => setValue(e.target.value)} className="input" />
          </Field>
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="Email (optional, will be hashed)">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="test@example.com" />
        </Field>
        <button disabled={busy} className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
          <Send className="w-4 h-4" /> {busy ? "Sending..." : "Send test event"}
        </button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Response</h3>
        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap min-h-[220px]">
{result || "No request sent yet."}
        </pre>
      </div>
      <style>{`.input{width:100%;height:2.5rem;padding:0 0.75rem;border:1px solid #cbd5e1;border-radius:0.5rem;color:#0f172a;outline:none}
        .input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}`}</style>
    </div>
  );
}

function ConfigPanel({ password, settings }: { password: string; settings: Awaited<ReturnType<typeof getSettings>> }) {
  const save = useServerFn(saveSettings);
  const [state, setState] = useState({
    fb_pixel_id: settings.fb_pixel_id,
    fb_capi_token: settings.fb_capi_token,
    fb_test_event_code: settings.fb_test_event_code,
    subid_param: settings.subid_param,
    default_currency: settings.default_currency,
    default_value: String(settings.default_value ?? 0),
    webhook_secret: settings.webhook_secret,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setState((s) => ({ ...s, [k]: e.target.value }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false); setErr("");
    const r = await save({ data: {
      password,
      fb_pixel_id: state.fb_pixel_id,
      custom_head_html: settings.custom_head_html,
      custom_body_html: settings.custom_body_html,
      postback_url: settings.postback_url,
      postback_method: settings.postback_method,
      postback_body: settings.postback_body,
      affiliate_url: settings.affiliate_url,
      fb_capi_token: state.fb_capi_token,
      fb_test_event_code: state.fb_test_event_code,
      subid_param: state.subid_param,
      default_currency: state.default_currency,
      default_value: Number(state.default_value),
      webhook_secret: state.webhook_secret,
    } });
    setSaving(false);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else setErr(r.error || "Save failed");
  };

  return (
    <form onSubmit={onSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-3xl">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Facebook CAPI Config</h3>
        <p className="text-sm text-slate-500">These credentials power both the client Pixel and the server-side Conversions API.</p>
      </div>
      <Field label="Facebook Pixel ID">
        <input value={state.fb_pixel_id} onChange={upd("fb_pixel_id")} className="cfg-input" placeholder="1234567890123456" />
      </Field>
      <Field label="Facebook CAPI Access Token">
        <textarea value={state.fb_capi_token} onChange={upd("fb_capi_token")} rows={4} className="cfg-input font-mono text-xs" placeholder="EAAG..." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Test Event Code">
          <input value={state.fb_test_event_code} onChange={upd("fb_test_event_code")} className="cfg-input" placeholder="TEST12345" />
        </Field>
        <Field label="SubID Parameter">
          <input value={state.subid_param} onChange={upd("subid_param")} className="cfg-input" placeholder="sub1" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Default Currency">
          <input value={state.default_currency} onChange={upd("default_currency")} className="cfg-input" placeholder="USD" />
        </Field>
        <Field label="Default Value">
          <input value={state.default_value} onChange={upd("default_value")} className="cfg-input" placeholder="0" />
        </Field>
      </div>
      <Field label="Webhook Secret (guards the Postback URL)">
        <input value={state.webhook_secret} onChange={upd("webhook_secret")} className="cfg-input font-mono text-sm" placeholder="a-long-random-string" />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button disabled={saving} className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Config"}
        </button>
        {saved && <span className="text-sm text-emerald-600 inline-flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
      <style>{`.cfg-input{width:100%;padding:0.625rem 0.875rem;border:1px solid #cbd5e1;border-radius:0.5rem;color:#0f172a;outline:none;background:white;font-size:0.875rem}
        .cfg-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
        .cfg-input[type=text],.cfg-input[type=number]{height:2.5rem}`}</style>
    </form>
  );
}

function GuidePanel() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl space-y-4 text-sm text-slate-700 leading-relaxed">
      <h3 className="text-base font-semibold text-slate-900">Integration Guide</h3>
      <ol className="list-decimal ml-5 space-y-2">
        <li>Fill in your <strong>Pixel ID</strong> and <strong>CAPI Access Token</strong> in the Config tab.</li>
        <li>Set a <strong>Webhook Secret</strong> — a long random string used to protect the postback endpoint.</li>
        <li>Copy the <strong>Sign Up</strong> or <strong>Purchase</strong> URL from Postback URLs and paste it into your brand's postback configuration.</li>
        <li>The landing page automatically captures <code className="bg-slate-100 px-1 rounded">fbclid</code> and forwards it to the affiliate link as <code className="bg-slate-100 px-1 rounded">{"{subid_param}"}</code>.</li>
        <li>When a conversion fires, the brand server calls the URL; the backend hashes PII and forwards to Meta.</li>
        <li>Use the <strong>Test Event Code</strong> to preview events in Meta Events Manager.</li>
      </ol>
    </div>
  );
}

/* ===================== Settings (landing content) ===================== */

function SettingsTab({ password, settings }: { password: string; settings: Awaited<ReturnType<typeof getSettings>> }) {
  const save = useServerFn(saveSettings);
  const [state, setState] = useState({
    custom_head_html: settings.custom_head_html,
    custom_body_html: settings.custom_body_html,
    postback_url: settings.postback_url,
    postback_method: settings.postback_method,
    postback_body: settings.postback_body,
    affiliate_url: settings.affiliate_url,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false); setErr("");
    const r = await save({ data: {
      password,
      fb_pixel_id: settings.fb_pixel_id,
      custom_head_html: state.custom_head_html,
      custom_body_html: state.custom_body_html,
      postback_url: state.postback_url,
      postback_method: state.postback_method,
      postback_body: state.postback_body,
      affiliate_url: state.affiliate_url,
      fb_capi_token: settings.fb_capi_token,
      fb_test_event_code: settings.fb_test_event_code,
      subid_param: settings.subid_param,
      default_currency: settings.default_currency,
      default_value: settings.default_value,
      webhook_secret: settings.webhook_secret,
    } });
    setSaving(false);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else setErr(r.error || "Save failed");
  };

  return (
    <form onSubmit={onSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-3xl">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Landing Page Settings</h3>
        <p className="text-sm text-slate-500">Affiliate destination, brand postback and custom HTML.</p>
      </div>
      <Field label="Affiliate URL">
        <input value={state.affiliate_url} onChange={(e) => setState((s) => ({ ...s, affiliate_url: e.target.value }))} className="cfg-input" />
      </Field>
      <Field label="Brand Postback URL (outbound — fired on code copy)">
        <input value={state.postback_url} onChange={(e) => setState((s) => ({ ...s, postback_url: e.target.value }))} className="cfg-input" placeholder="https://brand.com/postback?code={code}" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="HTTP Method">
          <select value={state.postback_method} onChange={(e) => setState((s) => ({ ...s, postback_method: e.target.value as "GET" | "POST" }))} className="cfg-input">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </Field>
      </div>
      <Field label="JSON Body (for POST)">
        <textarea rows={4} value={state.postback_body} onChange={(e) => setState((s) => ({ ...s, postback_body: e.target.value }))} className="cfg-input font-mono text-xs" placeholder='{"code":"{code}","event":"{event}"}' />
      </Field>
      <Field label="Custom <head> HTML">
        <textarea rows={4} value={state.custom_head_html} onChange={(e) => setState((s) => ({ ...s, custom_head_html: e.target.value }))} className="cfg-input font-mono text-xs" />
      </Field>
      <Field label="Custom <body> HTML (end)">
        <textarea rows={4} value={state.custom_body_html} onChange={(e) => setState((s) => ({ ...s, custom_body_html: e.target.value }))} className="cfg-input font-mono text-xs" />
      </Field>
      <div className="flex items-center gap-3 pt-2">
        <button disabled={saving} className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-sm text-emerald-600 inline-flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
      <style>{`.cfg-input{width:100%;padding:0.625rem 0.875rem;border:1px solid #cbd5e1;border-radius:0.5rem;color:#0f172a;outline:none;background:white;font-size:0.875rem}
        .cfg-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
        select.cfg-input, input.cfg-input{height:2.5rem}`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">{label}</div>
      {children}
    </label>
  );
}