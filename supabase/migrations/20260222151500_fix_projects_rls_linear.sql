-- supabase/migrations/20260222151500_fix_projects_rls_linear.sql
-- Fix for "Infinite recursion detected in policy" on projects table

-- 1. Drop the old problematic policies
DROP POLICY IF EXISTS "Korisnici vide samo svoje projekte" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_access" ON public.projects;
DROP POLICY IF EXISTS "projects_collab_access" ON public.projects;
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- 2. Create Linear Policies (Direct auth.uid() comparison)
-- This avoids recursion by not selecting from the same table within the policy where possible.

-- OWNER ACCESS (All operations)
CREATE POLICY "projects_owner_all" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- COLLABORATOR ACCESS (Select & Update only)
-- Note: We use the project_collaborators table, which does NOT reference projects back in its RLS 
-- unless we make it so. This should be safe.
CREATE POLICY "projects_collaborator_select" 
ON public.projects 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.project_collaborators 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
  )
);

CREATE POLICY "projects_collaborator_update" 
ON public.projects 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.project_collaborators 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
    AND role IN ('editor', 'owner')
  )
);
