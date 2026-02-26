# 🤖 ACA INSTRUKCIJE — ECO SCUBA PROJEKT
## AI Coding Assistant System Prompt (Google Antigravity · VS Code)
**Verzija:** 1.0 · **Datum:** 2026-02-22 · **Autor:** Senior Developer  
**Repozitorij:** `c:\PRIVATE\AI\Eco_Scuba`

---

> **OBAVEZNO PRIJE SVAKOG ZADATKA:**  
> Pročitaj `TECHNICAL_REPORT_AUTH_AI.md` u korijenu projekta.  
> Taj fajl je jedini izvor istine o trenutnom statusu sistema.

---

## 1. IDENTITET PROJEKTA (NEPROMJENJIVO)

ECO SCUBA je **AI-asistovani web sistem za pisanje projektnih prijedloga** za neprofitne organizacije.

| Parametar | Vrijednost |
|-----------|------------|
| Organizacija | KVS S.C.U.B.A., Trg grada Prato 24, 71000 Sarajevo, BiH |
| Supabase projekt | `eco-scuba` · Ref ID: `fmqxjqoqtwslhkwddgla` · Region: West EU (Ireland) |
| Supabase Dashboard | https://supabase.com/dashboard/project/fmqxjqoqtwslhkwddgla |
| Repozitorij | `c:\PRIVATE\AI\Eco_Scuba` |
| Primarni AI | Google Gemini API (REST) |
| Fallback AI | Anthropic Claude `claude-3-5-sonnet-20241022` |

⚠️ **Identitet organizacije je ugrađen u sve AI promptove (USTAV v3.1). Ne mijenjati bez eksplicitne instrukcije SD-a.**

---

## 2. TEHNIČKI STACK

| Sloj | Tehnologija | Kritična napomena |
|------|-------------|-------------------|
| Framework | React 18 + Vite | — |
| UI | Shadcn/UI + Tailwind CSS 3 | Nema custom CSS klasa bez Tailwind razloga |
| Animacije | Framer Motion | Koristiti samo za UX tranzicije |
| State | Zustand | `authStore.ts` + `uiStore.ts` — ne kreirati novi store bez odobrenja |
| Forms | React Hook Form + Zod | Sva validacija kroz Zod schema |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions Deno) | Uvijek `import { supabase } from '@/lib/supabase'` |
| Edge Runtime | Deno (Supabase Edge Runtime) | Stateless, bez Node.js API-a |
| AI primarni | Gemini REST API | MODEL_MAP je zakon — vidi Sekciju 5 |
| AI fallback | Claude `claude-3-5-sonnet-20241022` | Samo kad Gemini nije dostupan |
| Icons | Lucide React | — |
| Notifikacije | Sonner | `toast.success()` / `toast.error()` |

---

## 3. ARHITEKTURA — WIZARD TOK

```
KORAK 0 │ Step0PublicCall.tsx
         │ Javni poziv PDF → base64 → useAIStream() → Gemini REST
         │ Protocol: RIP_FAZA_0
         │ Output → formData.public_call_analysis (JSONB)
         │
KORAK 1 │ Step1Upload.tsx
         │ Obrazac PDF → supabase.functions.invoke('process-form-upload')
         │ JWT header OBAVEZAN: Authorization: Bearer ${session.access_token}
         │ Output → formData.extractedData
         │
KORAK 2 │ Step2Basics.tsx
         │ React Hook Form → title, donor_name, project_language, priority_area
         │ Output → formData.*
         │
KORAK 3 │ Step3APAData.tsx
         │ Konverzacijska pitanja → useAIStream() → APA protokol
         │ Output → formData.apa_collected_data (JSONB)
         │
FINISH  │ index.tsx → launchProject()
         │ INSERT INTO projects { title, donor_name, owner_id: user.id,
         │   status: 'in_progress', public_call_analysis,
         │   form_template_analysis, apa_collected_data }
         │ → Navigacija na /projects/{id}
```

### Ključni fajlovi (ne mijenjati bez razloga)

| Fajl | Uloga |
|------|-------|
| `src/hooks/useAIStream.ts` | Oracle — jedina tačka za Gemini REST pozive s frontend-a |
| `src/lib/apa-system-prompt.ts` | USTAV v3.1 — 700+ linija, ne skraćivati |
| `src/lib/supabase.ts` | Jedini Supabase client — uvijek ga importovati |
| `src/store/authStore.ts` | Session i user state — ne duplicirati |
| `supabase/functions/process-form-upload/index.ts` | Edge Function za PDF analizu |
| `supabase/functions/ai-generate-section/index.ts` | Edge Function za generisanje sekcija |

---

## 4. PRAVILA ZA PISANJE KODA (OBAVEZNA)

### 4.1 TypeScript

```typescript
// ✅ ISPRAVNO
const processData = (data: ProjectFormData): Promise<AnalysisResult> => { ... }

// ❌ ZABRANJENO — nema 'any', nema implicit types
const processData = (data: any) => { ... }
```

### 4.2 Supabase Client — NIKAD novi instance

```typescript
// ✅ UVIJEK ovako
import { supabase } from '@/lib/supabase'

// ❌ ZABRANJENO — uzrokuje auth probleme
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

### 4.3 Edge Functions — Error Handling

```typescript
// ✅ ISPRAVNO — Gateway vidi pravi HTTP status
return new Response(JSON.stringify({ error: 'Unauthorized' }), {
  status: 401,
  headers: { 'Content-Type': 'application/json' }
})

// ❌ ZABRANJENO — maskira pravi status, Edge Runtime hvata kao 500
throw new Error('Unauthorized')
```

### 4.4 Edge Functions — Supabase Client

```typescript
// ✅ OBAVEZNO za serverless — bez session persistencije
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})
```

### 4.5 JWT Auth na Edge Function pozivima

```typescript
// ✅ UVIJEK eksplicitno slati JWT header
const { data: { session } } = await supabase.auth.getSession()
if (!session) { /* early return */ }

await supabase.functions.invoke('process-form-upload', {
  body: formData,
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
})
```

### 4.6 AI Streaming — Loader State

```typescript
// ✅ OBAVEZNO — finally garantuje gašenje loadera
setIsStreaming(true)
try {
  const result = await callGeminiAPI(...)
  // obrada rezultata
} catch (error) {
  toast.error('AI greška: ' + error.message)
} finally {
  setIsStreaming(false)  // ← MORA biti ovdje, ne u try
}
```

### 4.7 Environment Variables

```typescript
// ✅ ISPRAVNO — iz VITE_ env varijabli
const apiKeys = JSON.parse(import.meta.env.VITE_GEMINI_API_KEYS)

// ❌ ZABRANJENO — nikad hardcoded ključevi u kodu
const apiKey = 'AIzaSy...'
```

### 4.8 SQL Migracije — Sigurni Pattern

```sql
-- ✅ UVIJEK ovaj pattern — idempotentne migracije
DROP POLICY IF EXISTS "naziv_polise" ON public.tabela;
CREATE POLICY "naziv_polise" ON public.tabela ...

-- Za tabele i kolone:
ALTER TABLE public.tabela 
  ADD COLUMN IF NOT EXISTS nova_kolona TEXT;

-- ❌ ZABRANJENO — pada ako postoji
CREATE POLICY "naziv_polise" ON public.tabela ...
```

---

## 5. GEMINI MODEL MAP (KRITIČNO — Ne mijenjati bez provjere)

```typescript
// useAIStream.ts — MODEL_MAP je jedini izvor istine za verzije
const MODEL_MAP: Record<string, { model: string; apiVersion: string }> = {
  'flash-2':    { model: 'gemini-2.0-flash-exp',       apiVersion: 'v1beta' },
  'flash-1.5':  { model: 'gemini-1.5-flash',           apiVersion: 'v1'     },
  'pro-1.5':    { model: 'gemini-1.5-pro',             apiVersion: 'v1'     },
  'flash-lite': { model: 'gemini-2.0-flash-lite',      apiVersion: 'v1beta' },
}

// PRAVILO:
//   v1beta  → gemini-2.0+ modeli
//   v1      → gemini-1.5 modeli
//
// ❌ ZABRANJENO — miješanje verzija garantuje HTTP 404
//   gemini-1.5-flash + v1beta = 404
//   gemini-2.0-flash + v1     = 404
```

---

## 6. UI DIZAJN — ZAMRZNUTO (FREEZE)

> **🔒 UI dizajn je zamrznut. ACA ne smije mijenjati vizualni izgled aplikacije bez izričitog pismenog odobrenja vlasnika projekta (SD/PO).**

### Šta spada pod "UI dizajn" — zabranjeno bez odobrenja

| Kategorija | Primjeri |
|------------|----------|
| Tailwind klase koje mjenjaju izgled | `bg-*`, `text-*`, `border-*`, `rounded-*`, `shadow-*`, `p-*`, `m-*` — osim ako su bug fix |
| Shadcn/UI komponente | Zamjena ili restrukturiranje postojećih komponenti |
| Framer Motion animacije | Dodavanje, uklanjanje ili izmjena tranzicija |
| Layout i raspored | Flex/Grid promjene, pozicioniranje elemenata |
| Tipografija | Font size, weight, color, spacing |
| Ikonice | Zamjena Lucide ikona |
| Boje i tema | Primarne, sekundarne, accent boje |
| Wizarda koraci | Vizualni tok, progress indikatori, step naslovi |

### Šta ACA SMIJE mijenjati bez odobrenja (nije UI)

- Logika i state management (Zustand, React hooks)
- API pozivi i error handling
- TypeScript tipovi i interfejsi
- SQL migracije i RLS polise
- Edge Function kod
- Validacijska pravila (Zod schema)
- Console logovi i debug poruke
- Tekstualni sadržaj koji nije dio brenda (error poruke, toast notifikacije)

### Procedura ako UI izmjena izgleda neophodna

```
1. ZAUSTAVI — ne mijenjaj ništa
2. Prijavi SD-u: "UI izmjena potrebna zbog [razlog]"
3. Opiši tačno šta treba promijeniti i zašto
4. Čekaj eksplicitno odobrenje prije bilo kakve izmjene
```

---

## 7. ZABRANJENI PATERNI (LISTA GREŠAKA IZ HISTORIJE)

| ❌ Zabrana | Razlog | Bug referenca |
|-----------|--------|---------------|
| RLS polisa koja čita istu tabelu u `USING` | Infinite recursion, PostgreSQL greška 42P17 | Bug #1 |
| `throw new Error()` u Edge Function handleru | Maskira HTTP status kao 500, Gateway ne vidi pravi razlog | Bug #2 |
| `gemini-1.5-*` model s `v1beta` API verzijom | Google reorganizovao API — 404 je garantovan | Bug #4 |
| Izostaviti `persistSession: false` u Edge Functions | Edge Function Supabase client mora biti stateless | Bug #2 |
| SQL migracija bez `DROP IF EXISTS` | Duplikat naziva = greška 42710 | Bug #6 |
| `protocol: 'RIP_FAZA_0'` bez ažuriranja CHECK constraint | ⚠️ OTVORENI BUG — INSERT pada s constraint violation | Problem A |
| Commitovati `.env.local` | Sadrži sve API ključeve — mora ostati lokalno | Sigurnost |
| Debuggirati "Message Channel Closed" kao app bug | To je Chrome ekstenzija (Adobe PDF) — testirati u Incognito | Bug #7 |
| Kreirati novi Supabase client instance | Uzrokuje session i auth probleme | Arhitektura |
| `setIsStreaming(false)` izvan `finally` bloka | Loader ostaje zauvijek aktivan ako AI poziv padne | Bug #3 |

---

## 8. WORKFLOW — KAKO PRISTUPITI ZADACIMA

### Korak 1 — Uvijek čitati prije kodiranja

```
1. Otvori TECHNICAL_REPORT_AUTH_AI.md
2. Provjeri sekciju "FINALNI STATUS SISTEMA"
3. Provjeri sekciju "POZNATI OTVORENI PROBLEMI"
4. Tek onda počni s kodom
```

### Korak 2 — Za SQL izmjene

```
1. Kreiraj novu migraciju: supabase/migrations/YYYYMMDDHHMMSS_opis.sql
2. Koristi DROP IF EXISTS + IF NOT EXISTS pattern
3. Pokreni RUČNO na:
   https://supabase.com/dashboard/project/fmqxjqoqtwslhkwddgla/sql/new
4. Nikad ne pokretati stare migracije ponovo
```

### Korak 3 — Za Edge Function izmjene

```
1. Editovati: supabase/functions/{name}/index.ts
2. Deploy naredba:
   npx supabase functions deploy {name} --project-ref fmqxjqoqtwslhkwddgla
3. Ili pokrenuti: deploy-functions.bat (u korijenu projekta)

⚠️ KRITIČNO: Bez redeploya izmjene u kodu nemaju efekta!
   Ovo je uzrokovalo sate debuggiranja (Bug #2).
```

### Korak 4 — Za frontend izmjene

```
1. npm run dev     ← lokalno testiranje
2. Provjeriti browser konzolu za:
   [Oracle] ✅ Uspješno! Model: gemini-2.0-flash-exp
3. Testirati u Incognito modu (bez Chrome ekstenzija)
4. Hard reload ako se stari kod pojavljuje: Ctrl+F5
```

### Korak 5 — Za provjeru AI konverzacija u bazi

```sql
-- Supabase SQL Editor
SELECT id, project_id, protocol, token_count, created_at
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 20;
```

---

## 9. AKTUALNI OTVORENI PROBLEMI (Prioritetni red)

### 🔴 PRIORITET #1 — Protocol CHECK Constraint (HITNO)

**Status:** Migracija je pripremljena kao `20260222170000_fix_protocol_constraint.sql`  
**Akcija:** Pokrenuti u SQL Editoru — ništa drugo ne treba raditi.

```sql
-- Pokrenuti na: supabase.com/dashboard/project/fmqxjqoqtwslhkwddgla/sql/new
ALTER TABLE public.ai_conversations 
DROP CONSTRAINT IF EXISTS ai_conversations_protocol_check;

ALTER TABLE public.ai_conversations 
ADD CONSTRAINT ai_conversations_protocol_check 
CHECK (protocol IN ('APA','RIP','RIP_FAZA_0','WA','SYSTEM'));
```

**Efekt bez fixa:** Svaki Korak 0 wizarda (analiza javnog poziva) ne može snimiti konverzaciju u bazu.

---

### 🟡 PRIORITET #2 — GEMINI_API_KEYS Secret

**Akcija:** Verificirati u Supabase Dashboard:  
`Settings → Edge Function Secrets → GEMINI_API_KEYS`

Očekivani format:
```json
["AIzaSy...", "AIzaSy...", "AIzaSy...", "AIzaSy...", "AIzaSy..."]
```

**Efekt bez fixa:** `process-form-upload` pada na Anthropic fallback — sporije i skuplje.

---

### 🟡 PRIORITET #3 — Stara `projects_collab_access` Polisa

**Akcija:** Provjeriti da li polisa postoji, pa dropnuti:

```sql
DROP POLICY IF EXISTS "projects_collab_access" ON public.projects;
```

**Efekt bez fixa:** Potencijalni RLS sukob s aktivnom `Enable access for owners` polisom.

---

## 10. BAZA PODATAKA — BRZA REFERENCA

### Ključne tabele

| Tabela | Primarna svrha |
|--------|----------------|
| `profiles` | Korisnički profil (1:1 s auth.users) |
| `projects` | Glavni entitet — svi podaci projekta u JSONB kolonama |
| `ai_conversations` | Log AI konverzacija po projektu i protokolu |
| `section_templates` | 22 predefinisane sekcije projektnog prijedloga |
| `project_sections` | Generirani sadržaj sekcija po projektu |

### RLS Princip (uvijek primjenjivati)

```sql
-- ✅ JEDINI ISPRAVNI PATTERN za projects tabelu
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id)

-- ❌ ZABRANJENO — uzrokuje rekurziju
USING (auth.uid() IN (SELECT owner_id FROM projects WHERE ...))
```

### `projects` — Ključne JSONB kolone

| Kolona | Sadržaj |
|--------|---------|
| `public_call_analysis` | Output RIP Faza 0 (Korak 0) |
| `form_template_analysis` | Output process-form-upload (Korak 1) |
| `apa_collected_data` | Korisnikovi odgovori iz APA protokola (Korak 3) |
| `apa_state` | APA State Register |
| `rip_data` | RIP Faza 1 output |

---

## 11. DEBUGGING CHECKLIST

Kada nešto ne radi, provjeri ovim redoslijedom:

```
[ ] 1. Je li Edge Function redeployovana nakon izmjene koda?
        → npx supabase functions deploy {name} --project-ref fmqxjqoqtwslhkwddgla

[ ] 2. Je li browser cache problem?
        → Ctrl+F5 ili testiraj u Incognito modu

[ ] 3. Je li JWT header poslan eksplicitno?
        → headers: { Authorization: `Bearer ${session.access_token}` }

[ ] 4. Je li session validan prije poziva?
        → const { data: { session } } = await supabase.auth.getSession()
        → if (!session) { toast.error(...); return; }

[ ] 5. Je li setIsStreaming(false) u finally bloku?

[ ] 6. Je li Gemini model u ispravnoj API verziji?
        → Provjeri MODEL_MAP u useAIStream.ts

[ ] 7. Je li GEMINI_API_KEYS secret postavljen u Supabase?
        → Dashboard → Settings → Edge Function Secrets

[ ] 8. Je li protocol vrijednost u CHECK listi ai_conversations?
        → Trenutno validne: 'APA','RIP','RIP_FAZA_0','WA','SYSTEM'
        → 'RIP_FAZA_0' radi tek nakon Prioriteta #1 migracije!
```

---

## 12. DEPLOY PROCEDURE

```bash
# Frontend — lokalni razvoj
npm run dev

# Frontend — production build
npm run build

# Edge Function — deploy pojedinačne funkcije
npx supabase functions deploy process-form-upload --project-ref fmqxjqoqtwslhkwddgla
npx supabase functions deploy ai-generate-section --project-ref fmqxjqoqtwslhkwddgla

# Edge Function — deploy sve odjednom
deploy-functions.bat

# SQL migracije — isključivo ručno u browser-u
# URL: https://supabase.com/dashboard/project/fmqxjqoqtwslhkwddgla/sql/new
```

---

## 13. KOMUNIKACIJA SA SD-om

Kada prijaviš završen zadatak, uvijek navedite:

1. **Šta je promijenjeno** — fajl(ovi) i priroda izmjene
2. **Šta je testirano** — konkretne provjere koje su urađene
3. **Šta ostaje otvoreno** — eventualni novi problemi ili rizici uočeni tokom rada
4. **Je li potreban redeploy** — da/ne, i koja funkcija

---

*Ovaj dokument je živi — ažurirati ga svaki put kad se otkrije novi bug ili promijeni arhitektura.*  
*Verzija dokumenta prati TECHNICAL_REPORT_AUTH_AI.md verziju.*
