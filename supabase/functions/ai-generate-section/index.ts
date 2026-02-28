// @ts-nocheck
// supabase/functions/ai-generate-section/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APA_SYSTEM_PROMPT = `Ti si APA (AI Prompting Assistant) — sistem za pisanje projektnih prijedloga ECO SCUBA Sekcije, KVS "S.C.U.B.A." Sarajevo, BiH.

KLJUČNA PRAVILA:
- Sav output MORA biti na bosanskom jeziku
- Piši kao iskusan stručnjak s 30+ godina iskustva (NE kao AI)
- Svaki podatak MORA biti klasificiran: [VERIFICIRAN], [INDICIRAN], [PRETPOSTAVLJEN] ili [PODATAK NEDOSTAJE]
- Na kraju SVAKOG outputa dodaj obavezni disclaimer o odgovornosti korisnika
- Output format: validan HTML
- Imena sekcija UVIJEK na bosanskom

IDENTITET:
ECO SCUBA Sekcija | Klub vodenih sportova "S.C.U.B.A."
Trg grada Prato 24, 71000 Sarajevo, BiH
Tel: +387 62 332 082 | Email: kvsscuba@gmail.com

PROTOKOLI:
- APA: Orkestracija, prikupljanje podataka, upravljanje stanjem
- RIP: Istraživanje i klasifikacija podataka za BiH kontekst
- WA: Pisanje projektnog prijedloga u HTML formatu

[FIX-01] Anti-hallucination: klasificiraj svaki podatak
[FIX-02] Sva imena sekcija na bosanskom
[FIX-03] Piši kao stručnjak, ne kao AI
[FIX-04] Expert-level argumentacija
[FIX-05] Obavezni disclaimer na kraju svakog outputa
[FIX-06] Change Application Protocol: analiza → elaboracija → potvrda → propagacija

OBAVEZNI DISCLAIMER (na kraju svakog outputa):
<div style="background-color:#fff3cd; border:2px solid #ffc107; border-radius:6px; padding:14px 18px; margin-top:24px; font-size:13px; color:#856404;">
<strong>⚠️ NAPOMENA O ODGOVORNOSTI KORISNIKA</strong><br><br>
APA sistem može sadržavati greške, netačne ili zastarjele podatke.<br>
<strong>Korisnik je dužan:</strong><br>
✔ Pažljivo pregledati svaki dio ove sekcije<br>
✔ Verificirati sve statističke podatke i zakonske reference<br>
✔ Preuzeti punu odgovornost za tačnost finalnog prijedloga
</div>`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { project_id, section_key, protocol, messages = [], project_context = {} } = body;

    const isPreview = project_id === 'preview';

    if (!isPreview) {
      const { data: project } = await supabaseAdmin.from('projects').select('owner_id').eq('id', project_id).single();
      if (!project) return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: corsHeaders });

      if (project.owner_id !== user.id) {
        const { data: collab } = await supabaseAdmin.from('project_collaborators').select('id').eq('project_id', project_id).eq('user_id', user.id).eq('status', 'accepted').single();
        if (!collab) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
      }
    }

    const TASK_PROMPTS: Record<string, string> = {
      'RIP_FAZA_0': 'Analiziraj priloženi javni poziv i vrati strukturiranu eligibility analizu u HTML formatu na bosanskom jeziku.',
      'APA': 'Postavljaj jedno po jedno pitanje korisniku kako bi prikupio potrebne podatke za projektni prijedlog.',
      'RIP': 'Na osnovu prikupljenih podataka generiši traženu sekciju projektnog prijedloga u HTML formatu na bosanskom jeziku.',
      'WA': 'Primijeni tražene izmjene konzistentno kroz dokument. Output: HTML na bosanskom.',
    };

    const contextBlock = `
ACTIVE PROJECT: ${JSON.stringify({ title: project_context?.title, donor: project_context?.donor, priority: project_context?.priority_area }, null, 2)}
TASK: Protocol ${protocol} | Section: "${section_key}"
${TASK_PROMPTS[protocol] || 'Generiši sadržaj na bosanskom jeziku.'}
${protocol === 'RIP' || protocol === 'WA' ? 'Write section in full HTML. Include FIX-05 disclaimer at end.' : ''}`;

    const allMessages = [
      { role: 'system', content: APA_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: contextBlock }
    ];

    // Use Lovable AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'AI Gateway not configured' }), { status: 500, headers: corsHeaders });
    }

    console.log(`[AI Gateway] Generating section "${section_key}" with protocol "${protocol}"`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: allMessages,
        max_tokens: 4096,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[AI Gateway] Error ${aiResponse.status}:`, errText.substring(0, 200));
      return new Response(JSON.stringify({ error: 'AI generation failed', details: errText.substring(0, 200) }), { status: 502, headers: corsHeaders });
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices?.[0]?.message?.content ?? '';

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), { status: 502, headers: corsHeaders });
    }

    console.log(`[AI Gateway] ✅ Success — ${text.length} chars`);

    // Log to ai_conversations
    if (!isPreview) {
      await supabaseAdmin.from('ai_conversations').insert({
        project_id, protocol,
        messages: [...allMessages, { role: 'assistant', content: text }],
        token_count: text.length,
      });
    }

    // Return as SSE stream for frontend compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', content: text })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });

  } catch (error: any) {
    console.error('[Error]', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
