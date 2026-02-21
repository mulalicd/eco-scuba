-- ECO SCUBA — Complete Schema Upgrade
-- This migration adds missing tables and columns required by the 3-protocol AI system.

-- Upgrade PROJECTS table with missing columns
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_locations') THEN
    ALTER TABLE public.projects ADD COLUMN project_locations JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_start_date') THEN
    ALTER TABLE public.projects ADD COLUMN project_start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_end_date') THEN
    ALTER TABLE public.projects ADD COLUMN project_end_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='requested_budget_km') THEN
    ALTER TABLE public.projects ADD COLUMN requested_budget_km NUMERIC(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='own_contribution_km') THEN
    ALTER TABLE public.projects ADD COLUMN own_contribution_km NUMERIC(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='direct_beneficiaries') THEN
    ALTER TABLE public.projects ADD COLUMN direct_beneficiaries INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='indirect_beneficiaries') THEN
    ALTER TABLE public.projects ADD COLUMN indirect_beneficiaries INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_language') THEN
    -- Rename or add project_language
    ALTER TABLE public.projects RENAME COLUMN language TO project_language;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='form_template_url') THEN
    ALTER TABLE public.projects ADD COLUMN form_template_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='form_template_analysis') THEN
    ALTER TABLE public.projects ADD COLUMN form_template_analysis JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='apa_state') THEN
    ALTER TABLE public.projects ADD COLUMN apa_state JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='rip_data') THEN
    ALTER TABLE public.projects ADD COLUMN rip_data JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='apa_collected_data') THEN
    ALTER TABLE public.projects ADD COLUMN apa_collected_data JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='final_html') THEN
    ALTER TABLE public.projects ADD COLUMN final_html TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='final_pdf_url') THEN
    ALTER TABLE public.projects ADD COLUMN final_pdf_url TEXT;
  END IF;
END $$;

-- SECTION TEMPLATES
CREATE TABLE IF NOT EXISTS public.section_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  section_title_bs TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  description TEXT
);

-- Insert default sections
INSERT INTO public.section_templates 
  (section_key, section_title_bs, display_order, is_optional)
VALUES
  ('naslovna_strana',      'Naslovna strana',                           0,  false),
  ('uvod',                 'Uvod',                                      1,  false),
  ('sazetak',              'Sažetak',                                   2,  false),
  ('potreba_problem',      'Potreba/problem u lokalnoj zajednici',      3,  false),
  ('razlozi_znacaj',       'Razlozi i značaj projekta',                 4,  false),
  ('ciljevi',              'Ciljevi projekta',                          5,  false),
  ('ciljna_grupa',         'Ciljna grupa',                              6,  false),
  ('sveukupni_cilj',       'Sveukupni cilj projekta',                   7,  false),
  ('specificni_ciljevi',   'Specifični ciljevi projekta',               8,  false),
  ('ocekivani_rezultati',  'Očekivani rezultati',                       9,  false),
  ('aktivnosti',           'Aktivnosti',                                10, false),
  ('pretpostavke_rizici',  'Pretpostavke i rizici',                     11, false),
  ('trajanje_projekta',    'Trajanje projekta',                         12, false),
  ('pracenje',             'Praćenje provedbe i izvještavanje',         13, false),
  ('budzet',               'Budžet',                                    14, false),
  ('vidljivost',           'Vidljivost (Promocija projekta)',           15, false),
  ('lista_aneksa',         'Lista aneksa',                              16, false),
  ('metodologija',         'Metodologija',                              17, true),
  ('odrzivost',            'Održivost projekta',                        18, true),
  ('rodna_ravnopravnost',  'Rodna ravnopravnost i socijalna inkluzija', 19, true),
  ('ekoloski_uticaj',      'Ekološki uticaj projekta',                  20, true),
  ('informacije_nositelju','Informacije o nositelju projekta',          21, true)
ON CONFLICT (section_key) DO NOTHING;

-- PROJECT SECTIONS
CREATE TABLE IF NOT EXISTS public.project_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_title_bs TEXT NOT NULL,
  content_html TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','generating','awaiting_approval','approved','revision_requested'
  )),
  version INTEGER DEFAULT 1,
  is_optional BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, section_key)
);

-- SECTION REVISIONS
CREATE TABLE IF NOT EXISTS public.section_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.project_sections(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_html TEXT NOT NULL,
  change_description TEXT,
  change_requested_by UUID REFERENCES public.profiles(id),
  generated_by TEXT DEFAULT 'wa_protocol',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANGE LOG
CREATE TABLE IF NOT EXISTS public.change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  change_description TEXT NOT NULL,
  affected_sections TEXT[] DEFAULT '{}',
  apa_analysis TEXT,
  apa_elaboration TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','approved_by_user','applied','rejected'
  )),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.project_sections(id),
  protocol TEXT NOT NULL CHECK (protocol IN ('APA','RIP','WA','SYSTEM')),
  messages JSONB DEFAULT '[]',
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT COLLABORATORS
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor','reviewer','viewer')),
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  section_assignments TEXT[] DEFAULT '{}',
  UNIQUE(project_id, user_id)
);

-- COLLABORATION TASKS
CREATE TABLE IF NOT EXISTS public.collaboration_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.project_sections(id),
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  task_type TEXT NOT NULL CHECK (task_type IN (
    'review_section','write_section','provide_data','approve_section','finalize_budget'
  )),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','done','overdue')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  type TEXT NOT NULL CHECK (type IN (
    'section_awaiting_approval','collaborator_invited','task_assigned',
    'task_overdue','project_completed','change_applied','mention'
  )),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT TEMPLATES (for APA Harmonization Engine)
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_project_id UUID REFERENCES public.projects(id),
  category TEXT,
  donor_type TEXT,
  sections_data JSONB DEFAULT '{}',
  quality_score NUMERIC(3,1),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enable
ALTER TABLE public.section_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Policies (Fixed syntax)
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "section_templates_select_all" ON public.section_templates;
    CREATE POLICY "section_templates_select_all" ON public.section_templates FOR SELECT USING (true);

    DROP POLICY IF EXISTS "projects_collab_access" ON public.projects;
    CREATE POLICY "projects_collab_access" ON public.projects 
      FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (SELECT user_id FROM public.project_collaborators WHERE project_id = id AND status = 'accepted')
      );
END $$;
