-- Permanent fix for RLS infinite recursion between projects and project_collaborators

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- Security-definer helpers to avoid policy-to-policy recursion
CREATE OR REPLACE FUNCTION public.is_project_owner(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = _project_id
      AND p.owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_collaborator(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_collaborators pc
    WHERE pc.project_id = _project_id
      AND pc.user_id = _user_id
      AND pc.status = 'accepted'
  );
$$;

-- Keep a single canonical access function and make it recursion-safe
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_project_owner(project_uuid, public.current_user_uuid())
    OR public.is_project_collaborator(project_uuid, public.current_user_uuid());
$$;

-- Recreate projects policies without direct cross-table policy recursion
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_select"
ON public.projects
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  owner_id = public.current_user_uuid()
  OR public.is_project_collaborator(id, public.current_user_uuid())
);

CREATE POLICY "projects_insert"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (owner_id = public.current_user_uuid());

CREATE POLICY "projects_update"
ON public.projects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  owner_id = public.current_user_uuid()
  OR public.is_project_collaborator(id, public.current_user_uuid())
)
WITH CHECK (owner_id = public.current_user_uuid());

CREATE POLICY "projects_delete"
ON public.projects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (owner_id = public.current_user_uuid());

-- Recreate collaborator policy to avoid querying projects directly in policy SQL
DROP POLICY IF EXISTS "collaborators_access" ON public.project_collaborators;

CREATE POLICY "collaborators_access"
ON public.project_collaborators
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  user_id = public.current_user_uuid()
  OR public.is_project_owner(project_id, public.current_user_uuid())
)
WITH CHECK (
  user_id = public.current_user_uuid()
  OR public.is_project_owner(project_id, public.current_user_uuid())
);