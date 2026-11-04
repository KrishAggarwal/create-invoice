import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { api } from '../services/api';

/**
 * Downloads invoice as a 1:1 Vector PDF with selectable, copyable text.
 * Sends the fully rendered invoice DOM to the backend Headless Chromium
 * engine (Puppeteer) for native vector PDF compilation.
 * 
 * Falls back to client-side canvas rasterization if the backend is unavailable.
 */
export async function downloadPDF(
  element: HTMLElement,
  filename: string,
  paperFormat: 'a4' | 'letter' = 'a4'
): Promise<void> {
  const isLetter = paperFormat === 'letter';
  const widthMm = isLetter ? '215.9mm' : '210mm';

  try {
    // 1. Gather all active styles and fonts from the parent document
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    // 2. Construct complete standalone HTML page for Chromium
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${filename}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    ${styleTags}
    <style>
      @page {
        size: ${isLetter ? 'letter' : 'A4'} portrait;
        margin: 0;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        background-color: #ffffff !important;
        width: ${widthMm};
        -webkit-font-smoothing: antialiased;
      }
      .no-print {
        display: none !important;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <div style="width: ${widthMm}; margin: 0 auto; background: #ffffff;">
      ${element.outerHTML}
    </div>
  </body>
</html>`;

    // 3. Request true Vector PDF from backend Headless Chromium
    const pdfBlob = await api.pdf.generate({
      html: fullHtml,
      filename,
      paperFormat,
    });

    // 4. Trigger direct browser download
    const downloadUrl = window.URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (backendError) {
    console.warn('Backend vector PDF failed, using client-side canvas fallback:', backendError);

    // Client-side fallback if backend server is unreachable
    const pageWidth = isLetter ? 215.9 : 210;
    const pageHeight = isLetter ? 279.4 : 297;

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', isLetter ? 'letter' : 'a4');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight + 1) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(filename);
  }
}
