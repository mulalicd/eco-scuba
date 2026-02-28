// @ts-nocheck
// supabase/functions/send-project-email/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Unauthorized');

        const token = authHeader.replace('Bearer ', '').trim();
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { persistSession: false } }
        );

        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) throw new Error('Unauthorized');

        const { recipient_email, recipient_name, project_title, message, pdf_storage_path } = await req.json();

        let attachments: any[] = [];

        if (pdf_storage_path) {
            const { data: pdfData } = await supabase.storage
                .from('generated-pdfs')
                .download(pdf_storage_path);

            if (pdfData) {
                const buffer = await pdfData.arrayBuffer();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                attachments = [{
                    filename: `${project_title.replace(/\s+/g, '_')}_prijedlog.pdf`,
                    content: base64,
                }];
            }
        }

        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (!resendKey) {
            return new Response(
                JSON.stringify({ error: 'Email service not configured. Please add RESEND_API_KEY.' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const emailHtml = `<!DOCTYPE html>
<html lang="bs">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc;">
  <div style="background:#003366;padding:28px 24px;border-radius:10px 10px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">ECO SCUBA</h1>
    <p style="color:#94b4d4;margin:6px 0 0;font-size:13px;">Klub vodenih sportova „S.C.U.B.A." | Sarajevo</p>
  </div>
  <div style="background:white;padding:32px 24px;border-radius:0 0 10px 10px;border:1px solid #e2e8f0;border-top:none;">
    <p style="color:#1a1a2e;font-size:15px;">Poštovani/a <strong>${recipient_name}</strong>,</p>
    <p style="color:#334155;line-height:1.6;">U prilogu se nalazi projektni prijedlog: <strong>${project_title}</strong></p>
    ${message ? `<p style="color:#334155;line-height:1.6;background:#f1f5f9;padding:14px;border-radius:6px;">${message}</p>` : ''}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">KVS „S.C.U.B.A." | Trg grada Prato 24, 71000 Sarajevo | +387 62 332 082</p>
  </div>
</body>
</html>`;

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'ECO SCUBA <noreply@ecoscuba.ba>',
                to: [recipient_email],
                subject: `Projektni prijedlog: ${project_title}`,
                html: emailHtml,
                attachments,
            }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Resend API error');

        return new Response(
            JSON.stringify({ success: true, id: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
