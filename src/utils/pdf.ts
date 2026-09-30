import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export async function downloadPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const imgWidth = a4Width;
  const imgHeight = (canvas.height * a4Width) / canvas.width;

  // If content fits in one page (with 1mm tolerance for rounding errors)
  if (imgHeight <= a4Height + 1) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page support
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= a4Height;

    while (heightLeft > 0) {
      position -= a4Height;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= a4Height;
    }
  }

  pdf.save(filename);
}
