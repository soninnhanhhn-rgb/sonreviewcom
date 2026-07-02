ALTER TABLE public.landing_settings
  ADD COLUMN IF NOT EXISTS fb_capi_token text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fb_test_event_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subid_param text NOT NULL DEFAULT 'sub1',
  ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS default_value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webhook_secret text NOT NULL DEFAULT '';