import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getSettings } from "../lib/settings.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      return { settings: await getSettings() };
    } catch {
      return {
        settings: {
          fb_pixel_id: "",
          custom_head_html: "",
          custom_body_html: "",
          postback_url: "",
          affiliate_url: "https://jobcopilot.com/",
        },
      };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JobCopilot Promo Code: 50% Off Premium (Official Discount)" },
      {
        name: "description",
        content:
          "Get 50% off JobCopilot Premium with official promo codes. AI applies to 50 jobs/day across 500,000+ companies. New user discount available now.",
      },
      { name: "author", content: "JobCopilot Promo" },
      { property: "og:title", content: "JobCopilot Promo Code: 50% Off Premium (Official Discount)" },
      {
        property: "og:description",
        content: "Activate the AI copilot that auto applies to jobs for you. Limited-time 50% off.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "JobCopilot Promo Code: 50% Off Premium (Official Discount)" },
      { name: "description", content: "A simple, visual landing page builder for promotional discount codes and Facebook conversion campaigns." },
      { property: "og:description", content: "A simple, visual landing page builder for promotional discount codes and Facebook conversion campaigns." },
      { name: "twitter:description", content: "A simple, visual landing page builder for promotional discount codes and Facebook conversion campaigns." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0df62c75-4907-4609-891b-a508d68eee76/id-preview-3f552a74--bb8515f0-1d8f-4801-9878-6055eabc796c.lovable.app-1782987228791.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0df62c75-4907-4609-891b-a508d68eee76/id-preview-3f552a74--bb8515f0-1d8f-4801-9878-6055eabc796c.lovable.app-1782987228791.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const data = Route.useLoaderData();
  const settings = data?.settings;
  const pixelId = settings?.fb_pixel_id?.trim();
  const pixelScript = pixelId
    ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`
    : "";
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {pixelScript ? (
          <script dangerouslySetInnerHTML={{ __html: pixelScript }} />
        ) : null}
        {settings?.custom_head_html ? (
          <div dangerouslySetInnerHTML={{ __html: settings.custom_head_html }} />
        ) : null}
      </head>
      <body>
        {pixelId ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        ) : null}
        {settings?.custom_body_html ? (
          <div dangerouslySetInnerHTML={{ __html: settings.custom_body_html }} />
        ) : null}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
