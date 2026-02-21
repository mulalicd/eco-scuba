-- Fix for RLS Disabled in Public lint errors
-- This migration ensures that all tables added in 20260221003000_complete_schema.sql 
-- have Row Level Security enabled and at least a basic policy where needed.

-- 1. Enable RLS on all relevant tables
ALTER TABLE IF EXISTS public.section_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.section_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collaboration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_templates ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies securely (avoiding IF NOT EXISTS which is invalid for CREATE POLICY)
DO $$ 
BEGIN 
  -- Section Templates: Anyone can view
  DROP POLICY IF EXISTS "section_templates_select_all" ON public.section_templates;
  CREATE POLICY "section_templates_select_all" ON public.section_templates FOR SELECT USING (true);

  -- Project Sections: Collaborators can view
  DROP POLICY IF EXISTS "project_sections_collab_access" ON public.project_sections;
  CREATE POLICY "project_sections_collab_access" ON public.project_sections 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = project_sections.project_id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
      ) OR EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_sections.project_id 
        AND owner_id = auth.uid()
      )
    );

  -- Section Revisions: Collaborators can view
  DROP POLICY IF EXISTS "section_revisions_collab_access" ON public.section_revisions;
  CREATE POLICY "section_revisions_collab_access" ON public.section_revisions 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = section_revisions.project_id 
        AND (owner_id = auth.uid() OR id IN (
          SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'accepted'
        ))
      )
    );

  -- Notifications: Users can view own
  DROP POLICY IF EXISTS "notifications_owner_access" ON public.notifications;
  CREATE POLICY "notifications_owner_access" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

  -- AI Conversations: Collaborators can view
  DROP POLICY IF EXISTS "ai_conv_collab_access" ON public.ai_conversations;
  CREATE POLICY "ai_conv_collab_access" ON public.ai_conversations 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = ai_conversations.project_id 
        AND (owner_id = auth.uid() OR id IN (
          SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'accepted'
        ))
      )
    );

  -- Project Collaborators: Involved users can view
  DROP POLICY IF EXISTS "collab_view_access" ON public.project_collaborators;
  CREATE POLICY "collab_view_access" ON public.project_collaborators 
    FOR SELECT USING (
      auth.uid() = user_id OR 
      EXISTS (
        SELECT 1 FROM public.projects WHERE id = project_collaborators.project_id AND owner_id = auth.uid()
      )
    );

  -- Collaboration Tasks: Assigned or Creator can view
  DROP POLICY IF EXISTS "tasks_view_access" ON public.collaboration_tasks;
  CREATE POLICY "tasks_view_access" ON public.collaboration_tasks 
    FOR SELECT USING (
      auth.uid() = assigned_to OR auth.uid() = assigned_by OR
      EXISTS (
        SELECT 1 FROM public.projects WHERE id = collaboration_tasks.project_id AND owner_id = auth.uid()
      )
    );

END $$;

