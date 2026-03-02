
-- Fix projects policies to PERMISSIVE
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (user_can_access_project(id));
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (user_can_access_project(id));
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Fix project_sections
DROP POLICY IF EXISTS "sections_access" ON public.project_sections;
CREATE POLICY "sections_access" ON public.project_sections FOR ALL TO authenticated USING (user_can_access_project(project_id)) WITH CHECK (user_can_access_project(project_id));

-- Fix profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fix ai_conversations
DROP POLICY IF EXISTS "ai_conv_access" ON public.ai_conversations;
CREATE POLICY "ai_conv_access" ON public.ai_conversations FOR ALL TO authenticated USING (user_can_access_project(project_id)) WITH CHECK (user_can_access_project(project_id));

-- Fix change_log
DROP POLICY IF EXISTS "change_log_access" ON public.change_log;
CREATE POLICY "change_log_access" ON public.change_log FOR ALL TO authenticated USING (user_can_access_project(project_id)) WITH CHECK (user_can_access_project(project_id));

-- Fix collaboration_tasks
DROP POLICY IF EXISTS "tasks_access" ON public.collaboration_tasks;
CREATE POLICY "tasks_access" ON public.collaboration_tasks FOR ALL TO authenticated USING ((auth.uid() = assigned_to) OR (auth.uid() = assigned_by) OR user_can_access_project(project_id)) WITH CHECK ((auth.uid() = assigned_to) OR (auth.uid() = assigned_by) OR user_can_access_project(project_id));

-- Fix notifications
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fix project_collaborators
DROP POLICY IF EXISTS "collaborators_access" ON public.project_collaborators;
CREATE POLICY "collaborators_access" ON public.project_collaborators FOR ALL TO authenticated USING ((auth.uid() = user_id) OR (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()))) WITH CHECK ((auth.uid() = user_id) OR (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())));

-- Fix section_revisions
DROP POLICY IF EXISTS "revisions_access" ON public.section_revisions;
CREATE POLICY "revisions_access" ON public.section_revisions FOR ALL TO authenticated USING (user_can_access_project(project_id)) WITH CHECK (user_can_access_project(project_id));

-- Fix section_templates
DROP POLICY IF EXISTS "section_templates_read" ON public.section_templates;
CREATE POLICY "section_templates_read" ON public.section_templates FOR SELECT TO authenticated USING (true);
