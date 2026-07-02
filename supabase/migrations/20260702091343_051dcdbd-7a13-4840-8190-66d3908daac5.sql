DROP POLICY IF EXISTS "public read settings" ON public.landing_settings;
REVOKE SELECT ON public.landing_settings FROM anon, authenticated;