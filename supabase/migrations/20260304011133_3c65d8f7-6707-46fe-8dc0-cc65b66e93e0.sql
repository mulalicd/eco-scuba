-- Fix persistent RLS failure on projects INSERT ... SELECT(returning)
-- Root cause: projects_select policy used user_can_access_project(id), which queries projects table
-- and can evaluate false for freshly inserted rows in the same statement snapshot.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- SELECT without self-referencing projects table
CREATE POLICY "projects_select"
ON public.projects
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  owner_id = public.current_user_uuid()
  OR EXISTS (
    SELECT 1
    FROM public.project_collaborators pc
    WHERE pc.project_id = projects.id
      AND pc.user_id = public.current_user_uuid()
      AND pc.status = 'accepted'
  )
);

-- INSERT strictly by owner
CREATE POLICY "projects_insert"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (owner_id = public.current_user_uuid());

-- UPDATE only for accessible projects; owner cannot be reassigned to another user
CREATE POLICY "projects_update"
ON public.projects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  owner_id = public.current_user_uuid()
  OR EXISTS (
    SELECT 1
    FROM public.project_collaborators pc
    WHERE pc.project_id = projects.id
      AND pc.user_id = public.current_user_uuid()
      AND pc.status = 'accepted'
  )
)
WITH CHECK (owner_id = public.current_user_uuid());

-- DELETE only by owner
CREATE POLICY "projects_delete"
ON public.projects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (owner_id = public.current_user_uuid());