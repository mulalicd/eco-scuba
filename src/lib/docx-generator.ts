import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

interface SectionData {
  section_title_bs: string;
  content_html: string;
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function htmlToDocxParagraphs(html: string): Paragraph[] {
  const div = document.createElement('div');
  div.innerHTML = html
    .replace(/<div[^>]*background-color:#fff3cd[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  const paragraphs: Paragraph[] = [];
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  let currentRuns: TextRun[] = [];

  const flushRuns = () => {
    if (currentRuns.length > 0) {
      paragraphs.push(new Paragraph({ children: [...currentRuns], spacing: { after: 120 } }));
      currentRuns = [];
    }
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        const parent = node.parentElement;
        const isBold = parent?.tagName === 'STRONG' || parent?.tagName === 'B' || parent?.closest('strong,b,th') !== null;
        const isItalic = parent?.tagName === 'EM' || parent?.tagName === 'I' || parent?.closest('em,i') !== null;
        currentRuns.push(new TextRun({ text, bold: isBold, italics: isItalic, size: 22, font: 'Arial' }));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName;

      if (['H1', 'H2', 'H3', 'H4'].includes(tag)) {
        flushRuns();
        const level = tag === 'H1' ? HeadingLevel.HEADING_1 : tag === 'H2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
        paragraphs.push(new Paragraph({
          text: el.textContent || '',
          heading: level,
          spacing: { before: 240, after: 120 },
        }));
        return;
      }

      if (tag === 'P' || tag === 'DIV') {
        flushRuns();
      }

      if (tag === 'BR') {
        flushRuns();
        return;
      }

      if (tag === 'LI') {
        flushRuns();
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `• ${el.textContent || ''}`, size: 22, font: 'Arial' })],
          spacing: { after: 60 },
          indent: { left: 360 },
        }));
        return;
      }

      if (tag === 'TABLE') {
        flushRuns();
        // Simple table text extraction
        const rows = el.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const cellTexts = Array.from(cells).map(c => c.textContent?.trim() || '');
          const isHeader = row.querySelector('th') !== null;
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: cellTexts.join(' | '),
              bold: isHeader,
              size: 20,
              font: 'Arial',
            })],
            spacing: { after: 40 },
          }));
        });
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return;
      }

      // Recurse into children
      for (let i = 0; i < node.childNodes.length; i++) {
        processNode(node.childNodes[i]);
      }

      if (tag === 'P' || tag === 'DIV') {
        flushRuns();
      }
    }
  };

  for (let i = 0; i < div.childNodes.length; i++) {
    processNode(div.childNodes[i]);
  }
  flushRuns();

  return paragraphs;
}

export async function generateProposalDOCX(
  sections: SectionData[],
  projectTitle: string,
  donorName?: string
): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: projectTitle, bold: true, size: 36, font: 'Arial', color: '003366' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  if (donorName) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `Donator: ${donorName}`, size: 22, font: 'Arial', color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }));
  }

  children.push(new Paragraph({
    children: [new TextRun({ text: 'KVS „S.C.U.B.A." | Trg grada Prato 24, 71000 Sarajevo | kvsscuba@gmail.com', size: 18, font: 'Arial', color: '888888' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));

  // Separator
  children.push(new Paragraph({
    border: { bottom: { color: '003366', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 300 },
  }));

  // Sections
  for (const section of sections) {
    children.push(new Paragraph({
      children: [new TextRun({ text: section.section_title_bs, bold: true, size: 28, font: 'Arial', color: '003366' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 200 },
    }));

    const sectionParagraphs = htmlToDocxParagraphs(section.content_html || '');
    children.push(...sectionParagraphs);
  }

  // Footer
  children.push(new Paragraph({
    border: { top: { color: '003366', space: 1, style: BorderStyle.SINGLE, size: 2 } },
    spacing: { before: 600 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'KVS „S.C.U.B.A." | Sarajevo | kvsscuba@gmail.com | +387 62 332 082', size: 16, font: 'Arial', color: '888888' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 },
  }));

  const doc = new Document({
    sections: [{ children }],
    creator: 'ECO SCUBA APA System',
    title: projectTitle,
    description: 'Projektni prijedlog generisan putem APA sistema',
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${projectTitle.replace(/[\s/\\?%*:|"<>]/g, '_')}_prijedlog.docx`);
}
