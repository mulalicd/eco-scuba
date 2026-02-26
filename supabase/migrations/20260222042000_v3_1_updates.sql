-- supabase/migrations/20260222042000_v3_1_updates.sql
-- ECO SCUBA — v3.1 Database Updates
-- Authoritative version according to USTAV v3.1

-- 1. Nadogradnja PROJECTS tabele za "Javni poziv" integraciju
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='public_call_url') THEN
    ALTER TABLE public.projects ADD COLUMN public_call_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='public_call_analysis') THEN
    ALTER TABLE public.projects ADD COLUMN public_call_analysis JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='eligibility_status') THEN
    ALTER TABLE public.projects ADD COLUMN eligibility_status TEXT 
      CHECK (eligibility_status IN ('eligible','eligible_with_risk','not_eligible','insufficient_data','not_analyzed'))
      DEFAULT 'not_analyzed';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='selected_program') THEN
    ALTER TABLE public.projects ADD COLUMN selected_program TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='call_requirements') THEN
    ALTER TABLE public.projects ADD COLUMN call_requirements JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='scoring_criteria') THEN
    ALTER TABLE public.projects ADD COLUMN scoring_criteria JSONB DEFAULT '[]';
  END IF;
END $$;

-- 2. Ažuriranje constrainta za AI_CONVERSATIONS protokol
ALTER TABLE public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_protocol_check;
ALTER TABLE public.ai_conversations ADD CONSTRAINT ai_conversations_protocol_check 
  CHECK (protocol IN ('APA','RIP','RIP_FAZA_0','WA','SYSTEM'));

-- 3. Harmonizacija SECTION_TEMPLATES prema Part 7 USTAVA
-- Prvo očistimo stare (opciono, ali sigurnije za redoslijed)
TRUNCATE TABLE public.section_templates CASCADE;

INSERT INTO public.section_templates (section_key, section_title_bs, display_order, is_optional) VALUES
  ('naslovna_strana',      'Naslovna strana',                           0,  false),
  ('uvod',                 'Uvod',                                      1,  false),
  ('sazetak',              'Sažetak',                                   2,  false),
  ('nositelj',             'Informacije o nositelju projekta',          3,  false),
  ('potreba_problem',      'Potreba/problem u lokalnoj zajednici',      4,  false),
  ('razlozi_znacaj',       'Razlozi i značaj projekta',                 5,  false),
  ('ciljevi',              'Ciljevi projekta',                          6,  false),
  ('ciljna_grupa',         'Ciljna grupa',                              7,  false),
  ('sveukupni_cilj',       'Sveukupni cilj projekta',                   8,  false),
  ('specificni_ciljevi',   'Specifični ciljevi projekta',               9,  false),
  ('ocekivani_rezultati',  'Očekivani rezultati',                       10, false),
  ('aktivnosti',           'Aktivnosti',                                11, false),
  ('pretpostavke_rizici',  'Pretpostavke i rizici',                     12, false),
  ('trajanje_projekta',    'Trajanje projekta',                         13, false),
  ('pracenje',             'Praćenje provedbe i izvještavanje',         14, false),
  ('budzet',               'Budžet',                                    15, false),
  ('vidljivost',           'Vidljivost (Promocija projekta)',           16, false),
  ('lista_aneksa',         'Lista aneksa',                              17, false),
  ('metodologija',         'Metodologija',                              18, true),
  ('odrzivost',            'Održivost projekta',                        19, true),
  ('rodna_ravnopravnost',  'Rodna ravnopravnost i socijalna inkluzija', 20, true),
  ('ekoloski_uticaj',      'Ekološki uticaj projekta',                  21, true)
ON CONFLICT (section_key) DO UPDATE 
SET section_title_bs = EXCLUDED.section_title_bs, 
    display_order = EXCLUDED.display_order, 
    is_optional = EXCLUDED.is_optional;

-- 4. Osiguravanje RLS politika (Refactor za "projects_access")
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_uuid AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.project_collaborators
    WHERE project_id = project_uuid AND user_id = auth.uid() AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Primjena univerzalnih polisa
DROP POLICY IF EXISTS "projects_access" ON public.projects;
CREATE POLICY "projects_access" ON public.projects FOR ALL USING (public.user_can_access_project(id));

DROP POLICY IF EXISTS "sections_access" ON public.project_sections;
CREATE POLICY "sections_access" ON public.project_sections FOR ALL USING (public.user_can_access_project(project_id));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_sections;
