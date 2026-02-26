-- Migration: Fix protocol CHECK constraint in ai_conversations
-- Status: ✅ POKRENUTO RUČNO u Supabase SQL Editoru — 2026-02-22 17:43 CET
-- Result: "Success. No rows returned" (očekivano za DDL)
-- Pokrenuo: SD (Senior Developer)
--
-- Problem: 'RIP_FAZA_0' se šalje iz Step0PublicCall.tsx ali nije bio u CHECK listi
-- Efekt buga: INSERT u ai_conversations s protocol='RIP_FAZA_0' padao s constraint violation
-- Efekt fixa: Korak 0 wizarda sada može snimati AI konverzacije u bazu

ALTER TABLE public.ai_conversations 
DROP CONSTRAINT IF EXISTS ai_conversations_protocol_check;

ALTER TABLE public.ai_conversations 
ADD CONSTRAINT ai_conversations_protocol_check 
CHECK (protocol IN ('APA', 'RIP', 'RIP_FAZA_0', 'WA', 'SYSTEM'));
