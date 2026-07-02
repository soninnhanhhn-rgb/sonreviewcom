CREATE TABLE public.landing_settings (
  id integer PRIMARY KEY DEFAULT 1,
  fb_pixel_id text DEFAULT '',
  custom_head_html text DEFAULT '',
  custom_body_html text DEFAULT '',
  postback_url text DEFAULT '',
  affiliate_url text DEFAULT 'https://jobcopilot.com/',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

GRANT SELECT ON public.landing_settings TO anon, authenticated;
GRANT ALL ON public.landing_settings TO service_role;

ALTER TABLE public.landing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read settings" ON public.landing_settings
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.landing_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;