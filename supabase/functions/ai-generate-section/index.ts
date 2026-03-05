// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APA_SYSTEM_PROMPT = `Ti si APA (AI Prompting Assistant) — sistem za pisanje projektnih prijedloga ECO SCUBA Sekcije, KVS "S.C.U.B.A." Sarajevo, BiH.

KRITIČNO — ANTI-AI DETEKCIJA:
- NIKADA ne piši generičke rečenice poput "U kontekstu...", "S obzirom na...", "Ovaj projekt ima za cilj..."
- NIKADA ne koristi AI obrasce: "sveobuhvatan pristup", "holistički", "sinergija", "inovativni pristup"
- Piši KONKRETNO, PRECIZNO, STRUČNO — kao da si čovjek sa 30+ godina iskustva u pisanju EU projektnih prijedloga
- Koristi SPECIFIČNE podatke koje je korisnik unio — NIKADA ne izmišljaj podatke
- Svaki broj, datum, lokacija, budžet MORA dolaziti iz korisničkih podataka — ako podatak nedostaje, označi ga [PODATAK NEDOSTAJE]
- Ton pisanja: profesionalan, sažet, argumentiran, bez patetike i uopćavanja
- Piši kao iskusni projektni menadžer koji poznaje BiH kontekst, ne kao AI

IDENTITET:
ECO SCUBA Sekcija | Klub vodenih sportova "S.C.U.B.A."
Trg grada Prato 24, 71000 Sarajevo, BiH
Tel: +387 62 332 082 | Email: kvsscuba@gmail.com

PROTOKOLI:
- APA: Orkestracija, prikupljanje podataka, upravljanje stanjem — koristi ISKLJUČIVO podatke iz State Registra
- RIP: Istraživanje i klasifikacija podataka za BiH kontekst — SVAKI podatak MORA imati klasifikaciju
- WA: Pisanje projektnog prijedloga u HTML formatu — STROGO na osnovu APA i RIP podataka

PRAVILA KLASIFIKACIJE (obavezna za svaki činjenični navod):
[VERIFICIRAN] — Podatak potvrđen iz zvaničnog izvora (zakon, statistika, registar)
[INDICIRAN] — Podatak proizlazi iz pouzdanih ali nezvaničnih izvora
[PRETPOSTAVLJEN] — Pretpostavka na osnovu konteksta, zahtijeva verifikaciju
[PODATAK NEDOSTAJE] — Podatak je neophodan ali nije dostupan

OBAVEZNI DISCLAIMER (na kraju svakog outputa):
<div style="background-color:#fff3cd; border:2px solid #ffc107; border-radius:6px; padding:14px 18px; margin-top:24px; font-size:13px; color:#856404;">
<strong>⚠️ NAPOMENA O ODGOVORNOSTI KORISNIKA</strong><br><br>
APA sistem može sadržavati greške, netačne ili zastarjele podatke.<br>
<strong>Korisnik je dužan:</strong><br>
✔ Pažljivo pregledati svaki dio ove sekcije<br>
✔ Verificirati sve statističke podatke i zakonske reference<br>
✔ Preuzeti punu odgovornost za tačnost finalnog prijedloga
</div>`;

// Section-specific writing instructions
const SECTION_INSTRUCTIONS: Record<string, string> = {
  'naslovna_strana': 'Generiši naslovnu stranu sa: nazivom projekta, nazivom aplikanta, nazivom donatora, datumom podnošenja, prioritetnom oblašću. Format: formalna tablica u HTML-u.',
  'uvod': 'Napiši uvod koji KONKRETNO opisuje problem koji projekt rješava, koristeći podatke o lokaciji, ciljnoj grupi i kontekstu iz State Registra. Ne koristi generičke fraze.',
  'sazetak': 'Napiši sažetak projekta (max 300 riječi) koji konkretno navodi: problem, cilj, aktivnosti, budžet, trajanje, ciljnu grupu. Koristi TAČNE brojke iz State Registra.',
  'informacije_o_nositelju': 'Opiši KVS S.C.U.B.A. sa konkretnim podacima: adresa, kontakt, iskustvo, kapaciteti, prethodni projekti. Koristi podatke iz State Registra.',
  'potreba_problem': 'Detaljno argumentiraj problem/potrebu koristeći RIP istraživačke podatke za BiH kontekst. Navedi statistike, zakone, lokalne prilike. Svaki podatak klasificiraj.',
  'razlozi_znacaj': 'Objasni zašto je ovaj projekt značajan i relevantan za lokalnu zajednicu. Poveži sa prioritetima donatora i strateškim dokumentima BiH.',
  'ciljevi_projekta': 'Definiši opći i specifične ciljeve koristeći SMART metodologiju. Ciljevi moraju direktno odgovarati problemu i korisničkim podacima.',
  'ciljna_grupa': 'Opiši ciljnu grupu sa tačnim brojevima direktnih i indirektnih korisnika iz State Registra. Objasni kriterije odabira i način uključivanja.',
  'sveukupni_cilj': 'Definiši sveukupni (opći) cilj projekta koji je širi od samog projekta i doprinosi dugoročnoj promjeni u zajednici.',
  'specificni_ciljevi': 'Definiši 2-4 specifična cilja koja su mjerljiva, vremenski ograničena i direktno vezana za aktivnosti i rezultate projekta.',
  'ocekivani_rezultati': 'Navedi konkretne, mjerljive rezultate sa indikatorima. Svaki rezultat mora biti vezan za specifični cilj. Koristi tačne brojeve iz State Registra.',
  'aktivnosti': 'Opiši svaku aktivnost detaljno: naziv, opis, odgovorna osoba/tim, vremenski okvir, resursi. Aktivnosti moraju logički voditi do očekivanih rezultata.',
  'pretpostavke_rizici': 'Identificiraj 4-6 rizika i pretpostavki. Za svaki rizik navedi: opis, vjerovatnoću, utjecaj, mjere ublažavanja. Budi konkretan za BiH kontekst.',
  'trajanje_projekta': 'Napravi Gantt-chart stil pregled u HTML tabeli sa mjesecima i aktivnostima. Koristi tačno trajanje iz State Registra.',
  'pracenje': 'Opiši sistem praćenja i evaluacije: indikatori, metode prikupljanja podataka, frekvencija izvještavanja, odgovorne osobe.',
  'budzet': 'Napravi detaljnu budžetsku tabelu u HTML formatu sa stavkama, jedinicama, cijenama i ukupnim iznosima. Koristi tačne iznose iz State Registra.',
  'vidljivost': 'Opiši plan promocije i vidljivosti projekta: aktivnosti, kanali, materijali, timeline. Uključi obaveze prema donatoru.',
  'lista_aneksa': 'Generiši listu svih potrebnih aneksa/priloga prema zahtjevima donatora i standardnoj praksi EU projektnih prijedloga u BiH.',
};

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
    const { project_id, section_key, protocol, messages = [], project_context = {}, existing_sections = [], change_request = '' } = body;

    const isPreview = project_id === 'preview';

    if (!isPreview) {
      const { data: project } = await supabaseAdmin.from('projects').select('owner_id').eq('id', project_id).single();
      if (!project) return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: corsHeaders });

      if (project.owner_id !== user.id) {
        const { data: collab } = await supabaseAdmin.from('project_collaborators').select('id').eq('project_id', project_id).eq('user_id', user.id).eq('status', 'accepted').single();
        if (!collab) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
      }
    }

    // Build rich context from ALL project data
    const apaData = project_context.apa_collected_data || {};
    const ripData = project_context.rip_data || {};

    const stateRegisterBlock = `
═══════════════════════════════════════════════
APA STATE REGISTER — OBAVEZNI IZVOR PODATAKA
═══════════════════════════════════════════════
Naziv projekta: ${apaData.project_title || project_context.title || '[PODATAK NEDOSTAJE]'}
Naziv aplikanta: ${apaData.applicant_name || 'KVS S.C.U.B.A. Sarajevo'}
Partneri: ${apaData.partners || '[PODATAK NEDOSTAJE]'}
Donator: ${apaData.donor_name || project_context.donor_name || '[PODATAK NEDOSTAJE]'}
Prioritetna oblast donatora: ${apaData.donor_priorities || project_context.priority_area || '[PODATAK NEDOSTAJE]'}
Prioritetna oblast projekta: ${apaData.priority_area || project_context.priority_area || '[PODATAK NEDOSTAJE]'}
Ciljna grupa: ${apaData.target_group || '[PODATAK NEDOSTAJE]'}
Direktni korisnici: ${apaData.direct_beneficiaries || project_context.direct_beneficiaries || '[PODATAK NEDOSTAJE]'}
Indirektni korisnici: ${project_context.indirect_beneficiaries || '[PODATAK NEDOSTAJE]'}
Lokacije projekta: ${apaData.project_locations || JSON.stringify(project_context.project_locations) || '[PODATAK NEDOSTAJE]'}
Trajanje (mjeseci): ${apaData.duration_months || project_context.project_duration_months || '[PODATAK NEDOSTAJE]'}
Datum početka: ${apaData.start_date || project_context.project_start_date || '[PODATAK NEDOSTAJE]'}
Datum završetka: ${apaData.end_date || project_context.project_end_date || '[PODATAK NEDOSTAJE]'}
Ukupni budžet (KM): ${apaData.total_budget || project_context.total_budget_km || '[PODATAK NEDOSTAJE]'}
Traženi iznos (KM): ${apaData.requested_amount || project_context.requested_budget_km || '[PODATAK NEDOSTAJE]'}
Vlastito učešće (KM): ${apaData.own_contribution || project_context.own_contribution_km || '[PODATAK NEDOSTAJE]'}
Glavne aktivnosti: ${apaData.main_activities || '[PODATAK NEDOSTAJE]'}
Strateški ciljevi: ${apaData.strategic_goals || '[PODATAK NEDOSTAJE]'}
Očekivani rezultati: ${apaData.expected_results || '[PODATAK NEDOSTAJE]'}
Metode: ${apaData.methods || '[PODATAK NEDOSTAJE]'}
Prethodno iskustvo: ${apaData.previous_experience || '[PODATAK NEDOSTAJE]'}
Jezik: ${apaData.project_language || project_context.project_language || 'bs'}
═══════════════════════════════════════════════

RIP ISTRAŽIVAČKI PODACI:
${ripData.legislative_framework ? `Legislativni okvir: ${ripData.legislative_framework}` : ''}
${ripData.environmental_context ? `Ekološki kontekst: ${ripData.environmental_context}` : ''}
${ripData.demographic_context ? `Demografski kontekst: ${ripData.demographic_context}` : ''}
${ripData.institutional_landscape ? `Institucije: ${ripData.institutional_landscape}` : ''}
${ripData.similar_projects ? `Slični projekti: ${ripData.similar_projects}` : ''}
${ripData.sector_data ? `Sektorski podaci: ${ripData.sector_data}` : ''}
${ripData.data_gaps?.length ? `Praznine podataka: ${ripData.data_gaps.join(', ')}` : ''}
`;

    // Include previously generated/approved sections for cross-reference
    const existingSectionsBlock = existing_sections.length > 0
      ? `\n═══════════════════════════════════════════════\nPRETHODNO GENERIRANE SEKCIJE (za konzistentnost):\n═══════════════════════════════════════════════\n${existing_sections.map((s: any) => `[${s.section_key}] ${s.section_title_bs}:\n${s.content_html?.substring(0, 500) || '(prazno)'}...\n`).join('\n')}`
      : '';

    const sectionInstruction = SECTION_INSTRUCTIONS[section_key] || 'Generiši sadržaj ove sekcije na bosanskom jeziku koristeći podatke iz State Registra.';

    const changeBlock = change_request
      ? `\nKORISNIK JE ZATRAŽIO IZMJENU:\n"${change_request}"\nPrimijeni ovu izmjenu TAČNO kako je opisana. Zadrži sve ostale podatke nepromijenjenim.\n`
      : '';

    const contextBlock = `
${stateRegisterBlock}
${existingSectionsBlock}
${changeBlock}

ZADATAK: Generiši sekciju "${section_key}" koristeći protokol ${protocol}.

SPECIFIČNE INSTRUKCIJE ZA OVU SEKCIJU:
${sectionInstruction}

KRITIČNA PRAVILA:
1. Koristi ISKLJUČIVO podatke iz State Registra iznad — NIKADA ne izmišljaj podatke
2. Ako podatak nedostaje, označi ga [PODATAK NEDOSTAJE] i predloži šta treba unijeti
3. Budi KONKRETAN — navodi imena, brojeve, datume, lokacije iz registra
4. Piši na bosanskom jeziku, profesionalnim tonom iskusnog projektnog menadžera
5. NE koristi AI obrasce i generičke fraze
6. Svaki činjenični navod MORA imati klasifikaciju: [VERIFICIRAN], [INDICIRAN], [PRETPOSTAVLJEN] ili [PODATAK NEDOSTAJE]
7. Output format: čist, validan HTML (bez markdown fences)
8. Na kraju OBAVEZNO dodaj disclaimer div
9. Osiguraj konzistentnost sa prethodno generiranim sekcijama
`;

    const allMessages = [
      { role: 'system', content: APA_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: contextBlock }
    ];

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'AI Gateway not configured' }), { status: 500, headers: corsHeaders });
    }

    console.log(`[AI Gateway] Generating section "${section_key}" with protocol "${protocol}" | State Register fields: ${Object.keys(apaData).length} | Existing sections: ${existing_sections.length}`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: allMessages,
        max_tokens: 8192,
        temperature: 0.5,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[AI Gateway] Error ${aiResponse.status}:`, errText.substring(0, 200));
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Previše zahtjeva. Pokušajte ponovo za minutu.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Nedovoljno kredita za AI generisanje.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({ error: 'AI generation failed', details: errText.substring(0, 200) }), { status: 502, headers: corsHeaders });
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices?.[0]?.message?.content ?? '';

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), { status: 502, headers: corsHeaders });
    }

    console.log(`[AI Gateway] ✅ Success — ${text.length} chars for "${section_key}"`);

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
