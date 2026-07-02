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
    title: "Ưu đãi phổ thông",
    desc: "Giảm 50% tháng đầu tiên gói JobCopilot Premium. Áp dụng cho người dùng mới.",
    badge: "Phổ biến nhất",
    highlight: true,
  },
  {
    code: "STUDENT50",
    title: "Ưu đãi sinh viên",
    desc: "Đang đi học hoặc vừa tốt nghiệp trong 6 tháng? Giảm ngay 50% để auto apply việc làm.",
    badge: "Sinh viên",
  },
  {
    code: "ENG50",
    title: "Kỹ sư & Developer",
    desc: "Dành riêng cho dân kỹ thuật. Giảm 50% để tập trung săn công việc mơ ước.",
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

    // Open brand link with code appended
    const base = (settings.affiliate_url || "https://jobcopilot.com/").trim();
    const url = base.includes("?")
      ? `${base}&promo=${encodeURIComponent(code)}`
      : `${base}?promo=${encodeURIComponent(code)}`;
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
              JobCopilot<span className="opacity-50"> ·Promo</span>
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
            Xem mã ↓
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
              Ưu đãi chính thức · Áp dụng toàn cầu
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Giảm <span style={{ color: "var(--brand-violet)" }}>50%</span> JobCopilot Premium
              — Auto apply việc làm 24/7
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
              AI Copilot ứng tuyển thay bạn tới 50 công việc/ngày trên hơn 500.000
              công ty. Nhận mã bên dưới, dán vào ô "Add Promotion Code" khi thanh toán.
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
                Nhận mã giảm giá ngay
                <Zap className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex" aria-label="5 sao">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: "var(--brand-violet)" }} />
                  ))}
                </div>
                <span>Được 100.000+ ứng viên tin dùng</span>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl">
              {[
                { icon: Zap, label: "Apply nhanh hơn", value: "50x" },
                { icon: Clock, label: "Tiết kiệm mỗi tuần", value: "10h+" },
                { icon: Target, label: "Nhiều phỏng vấn hơn", value: "10x" },
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
          <h2 className="text-3xl font-bold sm:text-4xl">Chọn mã phù hợp với bạn</h2>
          <p className="mt-3 text-muted-foreground">
            Bấm "Lấy mã & mở JobCopilot" — mã tự copy vào clipboard, tab mới sẽ mở
            trang JobCopilot để bạn dán vào ô khuyến mãi khi thanh toán.
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
                {copied === p.code ? "Đã copy — đang mở tab..." : "Lấy mã & mở JobCopilot"}
                <Zap className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold sm:text-3xl">3 bước để kích hoạt ưu đãi</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Chọn mã bên trên", d: "Bấm nút để copy mã và mở JobCopilot ở tab mới." },
              { n: "02", t: "Đăng ký / Đăng nhập", d: "Tạo tài khoản miễn phí hoặc đăng nhập tài khoản có sẵn." },
              { n: "03", t: "Dán mã lúc checkout", d: "Dán mã vào ô 'Add Promotion Code' — giảm giá áp dụng ngay." },
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

        {/* FAQ */}
        <div className="mt-20 grid gap-6 rounded-3xl p-8 md:grid-cols-2" style={{ background: "var(--muted)" }}>
          <div>
            <h3 className="text-2xl font-bold">Câu hỏi thường gặp</h3>
            <p className="mt-2 text-sm text-muted-foreground">Các thông tin cần biết trước khi dùng mã.</p>
          </div>
          <div className="space-y-5 text-sm">
            {[
              { q: "Có dùng được nhiều mã cùng lúc không?", a: "Không, mỗi tài khoản chỉ áp dụng 1 mã cho lần mua đầu tiên." },
              { q: "Ưu đãi kéo dài bao lâu?", a: "Giảm giá áp dụng cho tháng đầu tiên. Có thể huỷ bất kỳ lúc nào." },
              { q: "Mã áp dụng cho gói nào?", a: "Áp dụng cho tất cả các gói: theo tuần, tháng và quý." },
              { q: "Dùng ở Việt Nam được không?", a: "Có. JobCopilot hoạt động toàn cầu, hỗ trợ lọc theo quốc gia/timezone." },
            ].map((f) => (
              <div key={f.q} className="border-b border-border/60 pb-4 last:border-0">
                <div className="font-semibold">{f.q}</div>
                <div className="mt-1 text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Giới thiệu — Cách JobCopilot hoạt động */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Cách <span style={{ color: "var(--brand-violet)" }}>JobCopilot</span> hoạt động
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chỉ cần thiết lập một lần đơn giản, sau đó trợ lý AI của bạn sẽ tự động
            ứng tuyển các công việc thay bạn.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: 1, t: "Chọn tiêu chí việc làm", d: "Cho trợ lý biết những công việc bạn muốn tìm, sử dụng nhiều bộ lọc và tuỳ chọn khác nhau." },
            { n: 2, t: "Tải lên CV & sàng lọc", d: "Tải lên sơ yếu lý lịch và trả lời một vài câu hỏi sàng lọc — chỉ một lần duy nhất." },
            { n: 3, t: "AI ứng tuyển mỗi ngày", d: "Mỗi ngày, trợ lý sẽ tìm những công việc phù hợp và tự động điền đơn xin việc thay bạn." },
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

      {/* Tại sao nên sử dụng JobCopilot */}
      <section
        className="py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Tại sao nên sử dụng JobCopilot?</h2>
            <p className="mt-3 text-muted-foreground">
              Những lợi ích tuyệt vời khi ứng tuyển việc làm tự động bằng trí tuệ nhân tạo.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Search,
                t: "Tìm kiếm thêm các cuộc phỏng vấn",
                d: "Trung bình cần nộp 50–100 đơn để có 1 lời mời phỏng vấn. Với JobCopilot, bạn có thể gửi tới 50 đơn xin việc được cá nhân hoá mỗi ngày.",
              },
              {
                icon: Rocket,
                t: "Đừng bao giờ bỏ lỡ cơ hội",
                d: "Trợ lý AI tìm việc mới đăng hàng ngày trên hơn 500.000 trang tuyển dụng — bạn không bao giờ nộp đơn quá muộn nữa.",
              },
              {
                icon: Settings2,
                t: "Tự động ứng tuyển đúng việc",
                d: "Cấu hình bộ lọc chi tiết, AI tự động điều chỉnh CV cho từng vị trí và học theo phản hồi của bạn theo thời gian.",
              },
              {
                icon: Clock,
                t: "Tiết kiệm hàng giờ mỗi tuần",
                d: "Không còn dành hàng giờ điền form nhàm chán. Lấy lại quyền kiểm soát thời gian cho những điều thực sự quan trọng.",
              },
              {
                icon: ShieldCheck,
                t: "Hãy tự tin ứng tuyển",
                d: "Chỉ ứng tuyển vào những công việc đã được xác minh trên trang tuyển dụng chính thức — an toàn hơn, không tin giả mạo.",
              },
              {
                icon: Users,
                t: "Cộng đồng 100.000+ người dùng",
                d: "Tham gia cùng hàng trăm nghìn ứng viên đang tự động hoá hành trình tìm việc mỗi ngày bằng AI.",
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

      {/* Các tính năng của JobCopilot */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Các tính năng của JobCopilot</h2>
          <p className="mt-3 text-muted-foreground">
            Hơn 9 sản phẩm tìm việc thiết yếu được tích hợp trong một giải pháp duy nhất.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Auto Apply 50 đơn/ngày",
            "Tối ưu CV theo từng job",
            "Cover letter cá nhân hoá",
            "Trả lời câu hỏi sàng lọc",
            "Lọc theo mức lương & địa điểm",
            "Theo dõi tiến trình ứng tuyển",
            "Tìm email nhà tuyển dụng",
            "Cảnh báo việc mới mỗi ngày",
            "Hỗ trợ đa quốc gia & timezone",
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

      {/* Đánh giá người dùng */}
      <section
        className="py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Tham gia cùng hơn <span style={{ color: "var(--brand-violet)" }}>100.000</span> người dùng
            </h2>
            <p className="mt-3 text-muted-foreground">
              Họ đang tự động hoá quy trình ứng tuyển việc làm của mình bằng AI.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Jeremy W.", role: "Kỹ sư phần mềm", text: "JobCopilot là ứng dụng hỗ trợ tìm việc tốt nhất tôi từng dùng. Nó ứng tuyển chính xác hơn nhiều so với các app khác." },
              { name: "Abria P.", role: "Chuyên viên Marketing số", text: "Trợ lý AI đã nộp đơn vào hàng trăm vị trí và tôi nhận được lời mời phỏng vấn ngay trong tuần đầu tiên." },
              { name: "Lukas D.", role: "Kỹ sư Full Stack", text: "Cực kỳ ấn tượng với thiết kế đơn giản và cách bố trí hấp dẫn. Các ứng dụng tự động hoá cực kỳ hữu ích." },
              { name: "Helen N.", role: "Chăm sóc Khách hàng", text: "Việc tìm việc bớt căng thẳng hơn rất nhiều nhờ JobCopilot. Không cần ngồi cả ngày để nộp đơn nữa." },
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
                <div className="mt-3 flex" aria-label="5 sao">
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

          {/* CTA cuối */}
          <div
            className="mx-auto mt-14 max-w-3xl rounded-3xl p-10 text-center"
            style={{
              background: "linear-gradient(135deg, var(--brand-lavender), color-mix(in oklab, var(--brand-violet) 25%, white))",
            }}
          >
            <h3 className="text-2xl font-bold sm:text-3xl">
              Sẵn sàng tự động hoá quy trình nộp đơn xin việc?
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
              Lấy mã giảm 50% ngay
              <Zap className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Trang ưu đãi độc lập giới thiệu mã giảm giá JobCopilot chính thức. ©{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
}
