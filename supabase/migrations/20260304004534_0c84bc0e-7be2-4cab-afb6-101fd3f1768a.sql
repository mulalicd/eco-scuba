-- Ensure projects RLS uses direct authenticated user check for writes
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_insert"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_delete"
ON public.projects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());