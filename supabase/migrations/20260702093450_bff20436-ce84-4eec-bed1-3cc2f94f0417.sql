ALTER TABLE public.landing_settings
  ADD COLUMN IF NOT EXISTS postback_method text NOT NULL DEFAULT 'GET',
  ADD COLUMN IF NOT EXISTS postback_body text NOT NULL DEFAULT '';