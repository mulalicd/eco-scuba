
-- Drop all restrictive policies on projects and recreate as permissive
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- Recreate as PERMISSIVE policies
CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated
  USING (user_can_access_project(id));

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO authenticated
  USING (user_can_access_project(id));

CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Also fix other tables with restrictive policies
DROP POLICY IF EXISTS "ai_conv_access" ON public.ai_conversations;
CREATE POLICY "ai_conv_access" ON public.ai_conversations
  FOR ALL TO authenticated
  USING (user_can_access_project(project_id));

DROP POLICY IF EXISTS "change_log_access" ON public.change_log;
CREATE POLICY "change_log_access" ON public.change_log
  FOR ALL TO authenticated
  USING (user_can_access_project(project_id));

DROP POLICY IF EXISTS "sections_access" ON public.project_sections;
CREATE POLICY "sections_access" ON public.project_sections
  FOR ALL TO authenticated
  USING (user_can_access_project(project_id));

DROP POLICY IF EXISTS "revisions_access" ON public.section_revisions;
CREATE POLICY "revisions_access" ON public.section_revisions
  FOR ALL TO authenticated
  USING (user_can_access_project(project_id));

DROP POLICY IF EXISTS "tasks_access" ON public.collaboration_tasks;
CREATE POLICY "tasks_access" ON public.collaboration_tasks
  FOR ALL TO authenticated
  USING ((auth.uid() = assigned_to) OR (auth.uid() = assigned_by) OR user_can_access_project(project_id));

DROP POLICY IF EXISTS "collaborators_access" ON public.project_collaborators;
CREATE POLICY "collaborators_access" ON public.project_collaborators
  FOR ALL TO authenticated
  USING ((auth.uid() = user_id) OR (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())));

DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "section_templates_read" ON public.section_templates;
CREATE POLICY "section_templates_read" ON public.section_templates
  FOR SELECT TO authenticated
  USING (true);
