CREATE TABLE public.event_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null default 'Purchase',
  status text not null default 'ok',
  status_code integer,
  value numeric not null default 0,
  currency text not null default 'USD',
  click_id text,
  event_id text,
  source_ip text,
  request_payload jsonb,
  meta_response jsonb,
  error_message text
);
GRANT ALL ON public.event_logs TO service_role;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access" ON public.event_logs FOR SELECT USING (false);
CREATE INDEX event_logs_created_at_idx ON public.event_logs (created_at DESC);
CREATE INDEX event_logs_event_name_idx ON public.event_logs (event_name);