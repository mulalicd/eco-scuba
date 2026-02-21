import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.20.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { pdf_base64 } = await req.json();
        const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 2048,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "document",
                        source: { type: "base64", media_type: "application/pdf", data: pdf_base64 }
                    } as any,
                    {
                        type: "text",
                        text: `Analyze this project application form PDF precisely. Extract and return ONLY valid JSON:
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
No extra text, no markdown, ONLY the JSON object.`,
                    },
                ],
            }],
        });

        const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
        const clean = raw.replace(/```json|```/g, "").trim();

        return new Response(clean, {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
