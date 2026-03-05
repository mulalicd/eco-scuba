import html2pdf from 'html2pdf.js';

export async function generateProposalPDF(
    sections: Array<{ section_title_bs: string; content_html: string }>,
    projectTitle: string,
    donorName?: string
): Promise<void> {
    const headerHtml = `
    <div style="border-bottom: 3px solid #003366; padding-bottom: 16px; margin-bottom: 24px;">
      <h1 style="margin:0; color:#003366; font-size:18pt; font-family: Arial, sans-serif;">${projectTitle}</h1>
      ${donorName ? `<p style="margin:4px 0 0; color:#555; font-size:11pt; font-family: Arial, sans-serif;">Donator: ${donorName}</p>` : ''}
      <p style="margin:4px 0 0; color:#555; font-size:10pt; font-family: Arial, sans-serif;">
        KVS „S.C.U.B.A." | Trg grada Prato 24, 71000 Sarajevo | kvsscuba@gmail.com
      </p>
    </div>
  `;

    const bodyHtml = sections.map(s => `
    <div style="page-break-inside: avoid; margin-bottom: 20px;">
      <h2 style="background-color: #003366; color: white; padding: 8px 14px; font-size: 13pt; font-family: Arial, sans-serif; margin: 16px 0 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${s.section_title_bs}</h2>
      <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.6;">
        ${(s.content_html || '')
            .replace(/<div[^>]*background-color:#fff3cd[^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
        }
      </div>
    </div>
  `).join('\n');

    const fullHtml = `
    <div style="padding: 10px; font-family: Arial, sans-serif; color: #1a1a1a; background: white;">
      ${headerHtml}
      ${bodyHtml}
      <div style="margin-top:40px; border-top:1px solid #003366; padding-top:12px; font-size:9pt; color:#888; text-align:center;">
        KVS „S.C.U.B.A." | Sarajevo | kvsscuba@gmail.com | +387 62 332 082
      </div>
    </div>
  `;

    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    // CRITICAL: Element must be visible for html2canvas to render it
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.zIndex = '-1';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.background = 'white';
    document.body.appendChild(container);

    try {
        await html2pdf()
            .set({
                margin: [15, 15, 15, 15],
                filename: `${projectTitle.replace(/[\s/\\?%*:|"<>]/g, '_')}_prijedlog.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    width: 794,  // A4 width in px at 96dpi
                    windowWidth: 794,
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
