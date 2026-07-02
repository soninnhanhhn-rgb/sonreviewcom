import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSettings, firePostback } from "@/lib/settings.functions";
import { Sparkles, Zap, Clock, Target, Star, CheckCircle2, ShieldCheck, Search, Settings2, Rocket, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => ({ settings: await getSettings() }),
  component: Index,
});

type Promo = {
  code: string;
  title: string;
  desc: string;
  badge: string;
  highlight?: boolean;
};

const PROMOS: Promo[] = [
  {
    code: "50OFF",
    title: "Standard Offer",
    desc: "Save 50% on your first month of JobCopilot Premium. For new users only.",
    badge: "Most Popular",
    highlight: true,
  },
  {
    code: "STUDENT50",
    title: "Student Discount",
    desc: "Currently in college or graduated within 6 months? Take 50% off and auto apply to jobs.",
    badge: "Students",
  },
  {
    code: "ENG50",
    title: "Engineers & Developers",
    desc: "Built for software and technical talent. 50% off so you can focus on landing your dream role.",
    badge: "Engineering",
  },
];

function Index() {
  const { settings } = Route.useLoaderData();
  const postback = useServerFn(firePostback);
  const [copied, setCopied] = useState<string | null>(null);

  const handleClaim = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }

    // Fire FB Pixel Lead event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", { content_name: code });
      (window as any).fbq("track", "InitiateCheckout", { content_name: code });
    }

    // Fire server-side postback (S2S)
    void postback({ data: { code, event: "Lead" } }).catch(() => {});

    // Build outbound URL: promo code + fbclid mapped into brand's subid param
    const base = (settings.affiliate_url || "https://jobcopilot.com/").trim();
    const params = new URLSearchParams();
    params.set("promo", code);
    const subKey = (settings.subid_param || "sub1").trim();
    if (subKey) {
      // fbclid can arrive in the URL or be stored from a previous visit
      const urlParams = new URLSearchParams(window.location.search);
      let fbclid = urlParams.get("fbclid") || "";
      try {
        if (!fbclid) fbclid = window.localStorage.getItem("_fbclid") || "";
        if (urlParams.get("fbclid")) {
          window.localStorage.setItem("_fbclid", urlParams.get("fbclid")!);
        }
      } catch {
        // ignore storage errors
      }
      if (fbclid) params.set(subKey, fbclid);
    }
    const url = base + (base.includes("?") ? "&" : "?") + params.toString();
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky promo pin — luôn hiện để khách kéo xuống vẫn bấm lấy mã được */}
      <div
        className="sticky top-0 z-50 border-b border-border/60 backdrop-blur"
        style={{ background: "color-mix(in oklab, var(--background) 85%, transparent)" }}
      >
        <a
          href="#codes"
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-2 font-bold tracking-tight">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--brand-violet)", color: "var(--primary-foreground)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="truncate">
              JobCopilot<span className="opacity-50"> · Promo</span>
            </span>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm"
            style={{
              background: "var(--brand-violet)",
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-violet)",
            }}
          >
            Get code ↓
          </span>
        </a>
      </div>

      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-20 sm:pt-12 sm:pb-28">
          <div className="max-w-3xl text-foreground">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--brand-violet)" }}
              />
              Official offer · Works worldwide
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Save <span style={{ color: "var(--brand-violet)" }}>50%</span> on JobCopilot Premium
              — Auto apply to jobs 24/7
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Your AI copilot applies to up to 50 jobs a day across 500,000+ companies.
              Grab a code below and paste it in the "Add Promotion Code" field at checkout.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#codes"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: "var(--brand-violet)",
                  color: "var(--primary-foreground)",
                  boxShadow: "var(--shadow-violet)",
                }}
              >
                Get my promo code
                <Zap className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex" aria-label="5 stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: "var(--brand-violet)" }} />
                  ))}
                </div>
                <span>Trusted by 100,000+ job seekers</span>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl">
              {[
                { icon: Zap, label: "Faster applications", value: "50x" },
                { icon: Clock, label: "Saved every week", value: "10h+" },
                { icon: Target, label: "More interviews", value: "10x" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-4">
                  <Icon className="h-5 w-5" style={{ color: "var(--brand-violet)" }} />
                  <div className="mt-3 text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Codes */}
      <section id="codes" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Pick the promo code that fits you</h2>
          <p className="mt-3 text-muted-foreground">
            Click "Get code & open JobCopilot" — we'll copy the code to your clipboard and open
            JobCopilot in a new tab so you can paste it in the promo field at checkout.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PROMOS.map((p) => (
            <article
              key={p.code}
              className={`relative flex flex-col rounded-3xl border p-6 transition ${
                p.highlight
                  ? "border-transparent"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              style={
                p.highlight
                  ? {
                      background: "var(--brand-violet)",
                      color: "var(--primary-foreground)",
                      boxShadow: "var(--shadow-brand)",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={
                    p.highlight
                      ? { background: "rgba(255,255,255,0.2)", color: "var(--primary-foreground)" }
                      : { background: "var(--muted)", color: "var(--foreground)" }
                  }
                >
                  {p.badge}
                </span>
                <span className="text-3xl font-extrabold">50%</span>
              </div>
              <h3 className={`mt-5 text-xl font-bold ${p.highlight ? "" : ""}`}>{p.title}</h3>
              <p className={`mt-2 text-sm ${p.highlight ? "opacity-80" : "text-muted-foreground"}`}>
                {p.desc}
              </p>

              <div
                className="mt-6 flex items-center justify-center rounded-xl border border-dashed px-4 py-3"
                style={{
                  borderColor: p.highlight ? "rgba(255,255,255,0.25)" : "var(--border)",
                }}
              >
                <span className="font-mono text-lg font-bold tracking-widest">{p.code}</span>
              </div>

              <button
                onClick={() => handleClaim(p.code)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={
                  p.highlight
                    ? {
                        background: "oklch(1 0 0)",
                        color: "var(--brand-violet-deep)",
                      }
                    : {
                        background: "var(--brand-violet)",
                        color: "var(--primary-foreground)",
                      }
                }
              >
                {copied === p.code ? "Copied — opening tab..." : "Get code & open JobCopilot"}
                <Zap className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold sm:text-3xl">Redeem your discount in 3 steps</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Pick a code above", d: "Click a button to copy the code and open JobCopilot in a new tab." },
              { n: "02", t: "Sign up or log in", d: "Create a free account or sign in to your existing one." },
              { n: "03", t: "Paste at checkout", d: "Drop the code in the 'Add Promotion Code' field — the discount applies instantly." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--brand-violet)" }}
                >
                  {s.n}
                </div>
                <div className="mt-2 text-lg font-bold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How JobCopilot works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            How <span style={{ color: "var(--brand-violet)" }}>JobCopilot</span> works
          </h2>
          <p className="mt-3 text-muted-foreground">
            A simple one-time setup, then your AI assistant automatically applies to jobs for you.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: 1, t: "Set your job criteria", d: "Tell the assistant the roles you want with detailed filters, locations, and salary ranges." },
            { n: 2, t: "Upload your resume", d: "Upload your resume and answer a handful of screening questions — just once." },
            { n: 3, t: "AI applies daily", d: "Every day, your copilot finds matching jobs and submits tailored applications for you." },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-border bg-card p-6"
              style={{ boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--brand-violet) 20%, transparent)" }}
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "var(--brand-lavender)", color: "var(--brand-violet-deep)" }}
              >
                {s.n}
              </div>
              <div className="mt-4 text-lg font-bold">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why use JobCopilot */}
      <section
        className="py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Why choose JobCopilot?</h2>
            <p className="mt-3 text-muted-foreground">
              The real benefits of automating your job search with AI.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Search,
                t: "Land more interviews",
                d: "It takes 50–100 applications on average to get one interview. JobCopilot sends up to 50 personalized applications every single day.",
              },
              {
                icon: Rocket,
                t: "Never miss an opportunity",
                d: "Your AI assistant scans 500,000+ job boards daily for fresh listings — you never apply too late again.",
              },
              {
                icon: Settings2,
                t: "Apply to the right jobs",
                d: "Set granular filters and the AI tailors your resume to each role while learning from your feedback over time.",
              },
              {
                icon: Clock,
                t: "Save hours every week",
                d: "Stop wasting evenings filling out repetitive forms. Reclaim your time for what actually matters.",
              },
              {
                icon: ShieldCheck,
                t: "Apply with confidence",
                d: "Only submits to verified listings on official career pages — safer applications with no scams or fake postings.",
              },
              {
                icon: Users,
                t: "Join 100,000+ users",
                d: "Sit alongside hundreds of thousands of job seekers automating their search with AI every day.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="rounded-3xl border border-border bg-card p-6"
                style={{ boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--brand-violet) 20%, transparent)" }}
              >
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: "var(--brand-lavender)", color: "var(--brand-violet-deep)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-bold">{t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything JobCopilot does for you</h2>
          <p className="mt-3 text-muted-foreground">
            9+ essential job search tools bundled into one AI-powered platform.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Auto apply to 50 jobs/day",
            "Resume tailored to every job",
            "Personalized cover letters",
            "Auto answers to screener questions",
            "Filter by salary & location",
            "Application tracking dashboard",
            "Recruiter email finder",
            "Daily new-job alerts",
            "Multi-country & timezone support",
          ].map((feat) => (
            <div
              key={feat}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: "var(--brand-violet)" }}
              />
              <span className="text-sm font-medium">{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Join <span style={{ color: "var(--brand-violet)" }}>100,000+</span> job seekers
            </h2>
            <p className="mt-3 text-muted-foreground">
              Already automating their job search with AI.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Jeremy W.", role: "Software Engineer", text: "JobCopilot is the best job search tool I've ever used. It applies far more accurately than the other apps I tried." },
              { name: "Abria P.", role: "Digital Marketer", text: "The AI assistant applied to hundreds of roles and I had interview invites in my inbox in the first week." },
              { name: "Lukas D.", role: "Full Stack Engineer", text: "Really impressed with the clean design and layout. The auto-apply features are incredibly useful." },
              { name: "Helen N.", role: "Customer Support", text: "Job hunting is so much less stressful with JobCopilot. I don't have to spend all day submitting applications anymore." },
            ].map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-3xl border border-border bg-card p-6"
                style={{ boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--brand-violet) 20%, transparent)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold"
                    style={{ background: "var(--brand-lavender)", color: "var(--brand-violet-deep)" }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{r.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex" aria-label="5 stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: "var(--brand-violet)" }} />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm text-muted-foreground">
                  "{r.text}"
                </blockquote>
              </figure>
            ))}
          </div>

          {/* Final CTA */}
          <div
            className="mx-auto mt-14 max-w-3xl rounded-3xl p-10 text-center"
            style={{
              background: "linear-gradient(135deg, var(--brand-lavender), color-mix(in oklab, var(--brand-violet) 25%, white))",
            }}
          >
            <h3 className="text-2xl font-bold sm:text-3xl">
              Ready to automate your job applications?
            </h3>
            <a
              href="#codes"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                background: "var(--brand-violet)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-violet)",
              }}
            >
              Get my 50% off code
              <Zap className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Independent promo page featuring official JobCopilot discount codes. ©{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
}
