import html2pdf from 'html2pdf.js';

export async function generateProposalPDF(
    sections: Array<{ section_title_bs: string; content_html: string }>,
    projectTitle: string,
    donorName?: string
): Promise<void> {
    const printCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Arial&display=swap');
    @page {
      size: A4 portrait;
      margin: 25mm 20mm 25mm 20mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: white;
      line-height: 1.5;
    }
    h1 { font-size: 16pt; color: #003366; margin-bottom: 8px; }
    h2 { font-size: 13pt; color: #003366; margin: 16px 0 8px; }
    table { border-collapse: collapse; width: 100%; margin: 8px 0; }
    th, td { border: 1px solid #003366; padding: 6px 10px; font-size: 10.5pt; }
    th, .section-header {
      background-color: #003366 !important;
      color: white !important;
      font-weight: bold;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .field-label { background-color: #d6e4f0 !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-container { page-break-inside: avoid; margin-bottom: 20px; }
    .section-header { page-break-after: avoid; }
    .disclaimer { display: none !important; }
    .page-break { page-break-before: always; }
    tr { page-break-inside: avoid; }
  `;

    // Build document header
    const headerHtml = `
    <div style="border-bottom: 3px solid #003366; padding-bottom: 16px; margin-bottom: 24px;">
      <h1 style="margin:0; color:#003366; font-size:18pt;">${projectTitle}</h1>
      ${donorName ? `<p style="margin:4px 0 0; color:#555; font-size:11pt;">Donator: ${donorName}</p>` : ''}
      <p style="margin:4px 0 0; color:#555; font-size:10pt;">
        KVS „S.C.U.B.A." | Trg grada Prato 24, 71000 Sarajevo | kvsscuba@gmail.com
      </p>
    </div>
  `;

    // Assemble all sections — remove disclaimer divs from print
    const bodyHtml = sections.map(s => `
    <div class="section-container">
      <h2 class="section-header">${s.section_title_bs}</h2>
      <div>
        ${s.content_html
            .replace(/<div[^>]*background-color:#fff3cd[^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
        }
      </div>
    </div>
  `).join('\n');

    const fullHtml = `
    <!DOCTYPE html>
    <html lang="bs">
    <head>
      <meta charset="UTF-8">
      <style>${printCSS}</style>
    </head>
    <body>
      ${headerHtml}
      ${bodyHtml}
      <div style="margin-top:40px; border-top:1px solid #003366; padding-top:12px;
                  font-size:9pt; color:#888; text-align:center;">
        KVS „S.C.U.B.A." | Sarajevo | kvsscuba@gmail.com | +387 62 332 082
      </div>
    </body>
    </html>
  `;

    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    try {
        await html2pdf()
            .set({
                margin: 0,
                filename: `${projectTitle.replace(/[\s/\\?%*:|"<>]/g, '_')}_prijedlog.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                },
            pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                },
            })
            .from(container)
            .save();
    } finally {
        document.body.removeChild(container);
    }
}
