// supabase/functions/process-form-upload/index.ts
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.20.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.3.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function processWithGemini(keys: string[], pdfBase64: string) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i].trim();
        if (!key) continue;

        try {
            console.log(`[Gemini-Process] Attempting with key index ${i}`);
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `Analyze this project application form PDF precisely. Extract and return ONLY valid JSON:
{
  "form_language": "bs|en|hr|de|fr",
  "form_title": "detected form title if any",
  "sections": [
    {"key": "snake_case_key", "title_original": "exact text from form",
     "title_bs": "Bosnian translation", "order": 0, "required": true}
  ],
  "color_scheme": {
    "header_bg": "#hex",
    "header_text": "#hex",
    "row_alt_bg": "#hex",
    "border_color": "#hex"
  },
  "has_logo": true,
  "logo_position": "top_left|top_center|top_right",
  "font_name": "Arial|Times New Roman|Calibri|other",
  "page_orientation": "portrait|landscape",
  "has_page_numbers": true,
  "has_header_footer": true,
  "estimated_sections": 15
}
No extra text, no markdown, ONLY the JSON object.`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: pdfBase64,
                        mimeType: "application/pdf"
                    }
                }
            ]);

            return result.response.text();
        } catch (err: any) {
            console.error(`[Gemini-Process] Error with key ${i}:`, err.message);
            if (i === keys.length - 1) throw err;
        }
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        if (!authHeader) throw new Error('Unauthorized');

        const token = authHeader.replace('Bearer ', '').trim();
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) throw new Error('Invalid token');

        const { pdf_base64 } = await req.json();
        if (!pdf_base64) throw new Error('pdf_base64 is required');

        const geminiKeysString = Deno.env.get('GEMINI_API_KEYS') || '';
        const geminiKeys = geminiKeysString.split(',').filter(k => k.trim());

        if (geminiKeys.length > 0) {
            try {
                const geminiResult = await processWithGemini(geminiKeys, pdf_base64);
                const cleanJson = geminiResult.replace(/```json|```/g, "").trim();
                return new Response(cleanJson, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (geminiErr) {
                console.error('[Gemini process failed, falling back to Anthropic]', geminiErr);
            }
        }

        // Fallback to Anthropic
        const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [{
                role: "user",
                content: [
                    { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf_base64 } } as any,
                    { type: "text", text: "Analyze this project application form PDF precisely and return JSON as requested." }
                ],
            }],
        });

        const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
        const clean = raw.replace(/```json|```/g, "").trim();

        return new Response(clean, { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
