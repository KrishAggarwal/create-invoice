import type { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { browserService } from '../services/browser.js';

export async function generatePdf(req: AuthenticatedRequest, res: Response) {
  const { html, filename = 'invoice.pdf', paperFormat = 'a4' } = req.body;

  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid HTML content.' });
  }

  // Acquire concurrency token
  await browserService.acquireSlot();

  let context = null;
  let page = null;

  try {
    const browser = await browserService.getBrowser();
    context = await browser.createBrowserContext();
    page = await context.newPage();

    // Harden against SSRF and local file leaks
    await browserService.setupSecurityInterception(page);

    const isLetter = paperFormat === 'letter';

    // Set viewport matching 96 DPI standards
    await page.setViewport({
      width: isLetter ? 816 : 794,
      height: isLetter ? 1056 : 1123,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 10000,
    });

    // Ensure fonts and images are ready with a fail-safe timeout
    await Promise.race([
      page.evaluate(`
        Promise.all([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          ...Array.from(document.images).map((img) =>
            img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; setTimeout(r, 2000); })
          )
        ])
      `),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

    const pdfBuffer = await page.pdf({
      format: isLetter ? 'Letter' : 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      preferCSSPageSize: true,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    return res.end(pdfBuffer);
  } catch (error: any) {
    console.error('Puppeteer vector PDF generation error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate PDF.' });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    if (context) {
      await context.close().catch(() => {});
    }
    browserService.releaseSlot();
  }
}
