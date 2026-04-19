CREATE TABLE IF NOT EXISTS public.funding_calendar_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funder text NOT NULL,
  program text NOT NULL DEFAULT '',
  amount text NOT NULL DEFAULT '',
  deadline date NOT NULL,
  category text NOT NULL,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_calendar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on funding_calendar_items"
  ON public.funding_calendar_items FOR SELECT USING (true);

CREATE POLICY "Public insert access on funding_calendar_items"
  ON public.funding_calendar_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on funding_calendar_items"
  ON public.funding_calendar_items FOR UPDATE USING (true);

CREATE POLICY "Public delete access on funding_calendar_items"
  ON public.funding_calendar_items FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_funding_calendar_items_deadline
  ON public.funding_calendar_items (deadline);