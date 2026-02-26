// @ts-nocheck
// supabase/functions/process-form-upload/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PUBLIC_CALL_PROMPT = `Ti si ekspert za analizu javnih poziva za projektne prijedloge u Bosni i Hercegovini.
Analiziraj priloženi PDF dokument i vrati strukturiranu analizu u JSON formatu sa sljedećim poljima:
{
  "eligibility_criteria": ["kriterij 1", "kriterij 2"],
  "required_documents": ["dokument 1", "dokument 2"],
  "deadlines": {"prijava": "datum", "realizacija": "datum"},
  "budget_limits": {"min": broj, "max": broj, "currency": "KM"},
  "priority_areas": ["oblast 1", "oblast 2"],
  "raw_html_summary": "<h2>Sažetak javnog poziva</h2><p>...</p>"
}
Budi koncizan i precizan. Odgovaraj isključivo na bosanskom jeziku.`;

const APPLICATION_FORM_PROMPT = `Ti si ekspert za analizu obrazaca za projektne prijave.
Analiziraj priloženi PDF obrazac i vrati njegovu strukturu u JSON formatu sa sljedećim poljima:
{
  "form_language": "bs|en|hr",
  "form_title": "naziv obrasca",
  "sections": [{"key": "kljuc", "title_original": "naziv", "title_bs": "naziv na bs", "order": 0}],
  "color_scheme": {"header_bg": "#hex", "accent": "#hex"},
  "estimated_sections": 15
}
Budi koncizan i precizan.`;

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Auth validacija — prihvati svaki Bearer token, validiraj kroz service role
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Missing Authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Koristi service role client za validaciju — podržava i HS256 i ECC P-256
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false }
        });

        const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
        if (authError || !user) {
            console.error('[Auth] Failed:', authError?.message);
            return new Response(
                JSON.stringify({ error: 'Unauthorized', detail: authError?.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        console.log('[Auth] OK — user:', user.id);

        // Čitaj request body
        const body = await req.json();
        const { pdf_base64, text_content, source } = body;

        if (!pdf_base64) {
            return new Response(
                JSON.stringify({ error: 'Missing pdf_base64' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const isPublicCall = source === 'public_call';
        const prompt = isPublicCall ? PUBLIC_CALL_PROMPT : APPLICATION_FORM_PROMPT;

        console.log('[Process] Source:', source, '| Prompt type:', isPublicCall ? 'public_call' : 'application_form');

        // Environment varijable
        const geminiKeysString = Deno.env.get('GEMINI_API_KEYS') || '[]';
        const geminiKeys: string[] = JSON.parse(geminiKeysString);
        const groqKeysString = Deno.env.get('GROQ_API_KEYS') || '[]';
        const groqKeys: string[] = JSON.parse(groqKeysString);

        // Pokušaj Gemini — direktni REST fetch (SDK ne radi u Deno za multimodal PDF)
        if (geminiKeys.length > 0) {
            const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);

            for (const apiKey of shuffledKeys) {
                try {
                    console.log('[Gemini] Trying key:', apiKey.substring(0, 12) + '...');

                    const geminiResponse = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [
                                    {
                                        parts: [
                                            { text: prompt },
                                            {
                                                inline_data: {
                                                    mime_type: 'application/pdf',
                                                    data: pdf_base64
                                                }
                                            }
                                        ]
                                    }
                                ],
                                generationConfig: {
                                    maxOutputTokens: 2048,
                                    temperature: 0.7
                                }
                            })
                        }
                    );

                    if (geminiResponse.status === 429) {
                        console.warn('[Gemini] 429 — kvota iscrpljena, probam sljedeći ključ');
                        continue;
                    }

                    if (!geminiResponse.ok) {
                        const errText = await geminiResponse.text();
                        console.warn('[Gemini] Error:', geminiResponse.status, errText.substring(0, 100));
                        break;
                    }

                    const geminiData = await geminiResponse.json();
                    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                    console.log('[Gemini] Success — model: gemini-2.0-flash');

                    // Parsiraj JSON iz odgovora — Fix #3: JSON Resilience
                    let parsed;
                    try {
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_html_summary: text };
                    } catch (parseErr) {
                        console.warn('[Parse] JSON parsing failed, using raw text');
                        parsed = { raw_html_summary: text };
                    }

                    return new Response(
                        JSON.stringify(parsed),
                        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );

                } catch (err: any) {
                    console.warn('[Gemini] Fetch error:', err.message?.substring(0, 80));
                    continue;
                }
            }
        }

        // Groq fallback — koristi ekstrahovan tekst (ne PDF)
        if (groqKeys.length > 0 && text_content && text_content.length > 100) {
            console.log('[Groq] Pokušavam s ekstrahovanim tekstom...');
            const shuffledGroq = [...groqKeys].sort(() => Math.random() - 0.5);

            for (const groqKey of shuffledGroq) {
                try {
                    console.log('[Groq] Trying key:', groqKey.substring(0, 12) + '...');

                    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${groqKey}`
                        },
                        body: JSON.stringify({
                            model: 'llama-3.3-70b-versatile',
                            messages: [
                                {
                                    role: 'system',
                                    content: prompt
                                },
                                {
                                    role: 'user',
                                    content: `Analiziraj sljedeći javni poziv i vrati JSON analizu:\n\n${text_content}`
                                }
                            ],
                            max_tokens: 2048,
                            temperature: 0.7
                        })
                    });

                    if (groqResp.status === 429) {
                        console.warn('[Groq] 429 — probam sljedeći ključ');
                        continue;
                    }

                    if (!groqResp.ok) {
                        const errText = await groqResp.text();
                        console.warn('[Groq] Error:', groqResp.status, errText.substring(0, 100));
                        break;
                    }

                    const groqData = await groqResp.json();
                    const text = groqData.choices?.[0]?.message?.content ?? '';

                    if (text) {
                        console.log('[Groq] ✅ Success — llama-3.3-70b');
                        let parsed;
                        try {
                            const jsonMatch = text.match(/\{[\s\S]*\}/);
                            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_html_summary: text };
                        } catch {
                            parsed = { raw_html_summary: text };
                        }
                        return new Response(
                            JSON.stringify(parsed),
                            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                        );
                    }
                } catch (err: any) {
                    console.warn('[Groq] Fetch error:', err.message?.substring(0, 80));
                    continue;
                }
            }
        }

        // Claude fallback
        console.log('[Claude] Falling back to Anthropic...');
        const { default: Anthropic } = await import('npm:@anthropic-ai/sdk@0.20.0');
        const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;
        const anthropic = new Anthropic({ apiKey: anthropicKey });

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'document',
                        source: {
                            type: 'base64',
                            media_type: 'application/pdf',
                            data: pdf_base64,
                        },
                    } as any,
                    {
                        type: 'text',
                        text: prompt,
                    },
                ],
            }],
        });

        const claudeText = response.content[0].type === 'text' ? response.content[0].text : '';
        console.log('[Claude] Success');

        const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_html_summary: claudeText };

        return new Response(
            JSON.stringify(parsed),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('[Error]', error.message);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
