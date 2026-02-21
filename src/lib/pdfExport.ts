import html2pdf from 'html2pdf.js';

export const generatePDF = async (htmlContent: string, projectTitle: string) => {
  const element = document.createElement('div');
  element.innerHTML = `
    <div class="pdf-container">
      <style>
        @media print {
          @page { size: A4; margin: 25mm 20mm; }
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; background: #fff; }
          .section-header { 
            background-color: #003366 !important; 
            color: white !important; 
            padding: 10px 15px;
            margin-top: 20px;
            font-size: 14pt;
            font-weight: bold;
            -webkit-print-color-adjust: exact; 
          }
          .section-content { margin-bottom: 20px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          table, th, td { border: 1px solid #003366 !important; padding: 8px; }
          th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
          .section-container { page-break-inside: avoid; }
          .no-print { display: none !important; }
          h1 { color: #003366; text-align: center; margin-bottom: 30px; }
        }
        .pdf-container { padding: 40px; }
      </style>
      <h1>${projectTitle}</h1>
      ${htmlContent}
    </div>
  `;

  document.body.appendChild(element);

  const opt = {
    margin: 20,
    filename: `${projectTitle.replace(/\s+/g, '_')}_projektni_prijedlog.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    document.body.removeChild(element);
  }
};
