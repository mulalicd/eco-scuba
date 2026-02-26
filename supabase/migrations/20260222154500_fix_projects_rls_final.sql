-- supabase/migrations/20260222154500_fix_projects_rls_final.sql
-- 1. Obriši problematične polise koje uzrokuju infinite recursion
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Korisnici vide samo svoje projekte" ON public.projects;
DROP POLICY IF EXISTS "Enable access for owners" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_all" ON public.projects;
DROP POLICY IF EXISTS "projects_collaborator_select" ON public.projects;
DROP POLICY IF EXISTS "projects_collaborator_update" ON public.projects;

-- 2. Kreiraj novu, čistu polisu bez rekursije
-- Koristimo direktnu provjeru auth.uid() bez pozivanja tabele unutar Using klauzule
CREATE POLICY "Enable access for owners" 
ON public.projects FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

-- 3. Omogući RLS (za svaki slučaj ako je isključen)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
