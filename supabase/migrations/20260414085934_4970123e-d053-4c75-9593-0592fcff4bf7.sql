
-- ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  hook TEXT NOT NULL DEFAULT '',
  logline TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT '',
  target_broadcaster TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  slate_id TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  why_now TEXT NOT NULL DEFAULT '',
  people_access TEXT NOT NULL DEFAULT '',
  archive_status TEXT NOT NULL DEFAULT '',
  rights_status TEXT NOT NULL DEFAULT '',
  comparables TEXT NOT NULL DEFAULT '',
  commission_check TEXT NOT NULL DEFAULT '',
  sources TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on ideas" ON public.ideas FOR SELECT USING (true);
CREATE POLICY "Public insert access on ideas" ON public.ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on ideas" ON public.ideas FOR UPDATE USING (true);
CREATE POLICY "Public delete access on ideas" ON public.ideas FOR DELETE USING (true);

-- user_decisions table
CREATE TABLE public.user_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on user_decisions" ON public.user_decisions FOR SELECT USING (true);
CREATE POLICY "Public insert access on user_decisions" ON public.user_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on user_decisions" ON public.user_decisions FOR UPDATE USING (true);
CREATE POLICY "Public delete access on user_decisions" ON public.user_decisions FOR DELETE USING (true);

-- user_pipeline table
CREATE TABLE public.user_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  slate_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'swiped',
  notes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id)
);

ALTER TABLE public.user_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on user_pipeline" ON public.user_pipeline FOR SELECT USING (true);
CREATE POLICY "Public insert access on user_pipeline" ON public.user_pipeline FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on user_pipeline" ON public.user_pipeline FOR UPDATE USING (true);
CREATE POLICY "Public delete access on user_pipeline" ON public.user_pipeline FOR DELETE USING (true);

-- deep_dive_reports table
CREATE TABLE public.deep_dive_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL DEFAULT '',
  verdict_reason TEXT NOT NULL DEFAULT '',
  story_verified BOOLEAN NOT NULL DEFAULT false,
  verified_detail TEXT NOT NULL DEFAULT '',
  full_story TEXT NOT NULL DEFAULT '',
  people TEXT NOT NULL DEFAULT '',
  archive TEXT NOT NULL DEFAULT '',
  rights_detail TEXT NOT NULL DEFAULT '',
  commission_check TEXT NOT NULL DEFAULT '',
  broadcaster_fit TEXT NOT NULL DEFAULT '',
  format_recommendation TEXT NOT NULL DEFAULT '',
  why_now TEXT NOT NULL DEFAULT '',
  red_flags TEXT NOT NULL DEFAULT '',
  sources TEXT NOT NULL DEFAULT '',
  generated_at TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id)
);

ALTER TABLE public.deep_dive_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on deep_dive_reports" ON public.deep_dive_reports FOR SELECT USING (true);
CREATE POLICY "Public insert access on deep_dive_reports" ON public.deep_dive_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on deep_dive_reports" ON public.deep_dive_reports FOR UPDATE USING (true);
CREATE POLICY "Public delete access on deep_dive_reports" ON public.deep_dive_reports FOR DELETE USING (true);

-- build_room_documents table
CREATE TABLE public.build_room_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, document_type)
);

ALTER TABLE public.build_room_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on build_room_documents" ON public.build_room_documents FOR SELECT USING (true);
CREATE POLICY "Public insert access on build_room_documents" ON public.build_room_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access on build_room_documents" ON public.build_room_documents FOR UPDATE USING (true);
CREATE POLICY "Public delete access on build_room_documents" ON public.build_room_documents FOR DELETE USING (true);

-- Trigger for updated_at on user_pipeline
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_pipeline_updated_at
  BEFORE UPDATE ON public.user_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_build_room_documents_updated_at
  BEFORE UPDATE ON public.build_room_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
