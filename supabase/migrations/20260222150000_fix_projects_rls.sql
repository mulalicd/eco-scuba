-- supabase/migrations/20260222150000_fix_projects_rls.sql
-- Fix for potential RLS infinite loop and INSERT failures

-- 1. Drop the problematic "all-in-one" policy
DROP POLICY IF EXISTS "projects_access" ON public.projects;

-- 2. Separate policies for different operations (cleaner and safer)
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = id AND user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = id AND user_id = auth.uid() AND status = 'accepted' AND role = 'editor'
    )
  );

CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE USING (
    owner_id = auth.uid()
  );

-- 3. Adjust other tables to avoid circular references
DROP POLICY IF EXISTS "sections_access" ON public.project_sections;
CREATE POLICY "sections_access" ON public.project_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = project_id AND user_id = auth.uid() AND status = 'accepted'
    )
  );
