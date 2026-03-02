-- Robust user id resolver for RLS contexts
create or replace function public.current_user_uuid()
returns uuid
language sql
stable
set search_path = public
as $$
  select coalesce(
    auth.uid(),
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  )
$$;

-- Update access helper to use robust resolver
create or replace function public.user_can_access_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where id = project_uuid
      and owner_id = public.current_user_uuid()
  )
  or exists (
    select 1
    from public.project_collaborators
    where project_id = project_uuid
      and user_id = public.current_user_uuid()
      and status = 'accepted'
  );
$$;

-- Recreate only projects policies with robust user resolver
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_insert"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = public.current_user_uuid());

CREATE POLICY "projects_delete"
ON public.projects
FOR DELETE
TO authenticated
USING (owner_id = public.current_user_uuid());