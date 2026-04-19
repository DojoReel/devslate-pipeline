CREATE TABLE public.market_radar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  broadcaster TEXT NOT NULL DEFAULT '',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.market_radar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on market_radar_items" ON public.market_radar_items FOR SELECT USING (true);
CREATE POLICY "Public insert access on market_radar_items" ON public.market_radar_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on market_radar_items" ON public.market_radar_items FOR UPDATE USING (true);
CREATE POLICY "Public delete access on market_radar_items" ON public.market_radar_items FOR DELETE USING (true);

CREATE INDEX idx_market_radar_items_published_date ON public.market_radar_items(published_date DESC);