-- supabase/migrations/20260222160000_fix_ai_conversations_rls.sql
-- Allow AI module to insert analyses without infinite recursion or strict checks during the wizard phase

DROP POLICY IF EXISTS "AI can insert conversations" ON public.ai_conversations;
CREATE POLICY "AI can insert conversations" 
ON public.ai_conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Ensure authenticated users can view conversations they have access to via project ownership
DROP POLICY IF EXISTS "Users can view relevant conversations" ON public.ai_conversations;
CREATE POLICY "Users can view relevant conversations" 
ON public.ai_conversations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND owner_id = auth.uid()
  )
);
