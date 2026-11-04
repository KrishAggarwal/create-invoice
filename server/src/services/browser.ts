import puppeteer, { Browser, Page } from 'puppeteer';

class BrowserService {
  private browser: Browser | null = null;
  private isLaunching = false;
  private activeJobs = 0;
  private readonly maxConcurrentJobs = 4;
  private waitQueue: Array<() => void> = [];

  /**
   * Returns a healthy singleton headless Chromium browser instance.
   */
  async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.isLaunching) {
      while (this.isLaunching) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.browser && this.browser.connected) {
        return this.browser;
      }
    }

    this.isLaunching = true;
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
          '--disable-gpu',
        ],
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
      });

      return this.browser;
    } finally {
      this.isLaunching = false;
    }
  }

  /**
   * Acquire a slot for PDF generation to prevent concurrent CPU/memory exhaustion.
   */
  async acquireSlot(): Promise<void> {
    if (this.activeJobs < this.maxConcurrentJobs) {
      this.activeJobs++;
      return;
    }

    return new Promise((resolve) => {
      this.waitQueue.push(() => {
        this.activeJobs++;
        resolve();
      });
    });
  }

  /**
   * Release a slot and wake up next waiting job.
   */
  releaseSlot(): void {
    this.activeJobs = Math.max(0, this.activeJobs - 1);
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }

  /**
   * Hardens a Puppeteer page against SSRF and local file access.
   */
  async setupSecurityInterception(page: Page): Promise<void> {
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const url = req.url().toLowerCase();

      // Block local filesystem access
      if (url.startsWith('file:') || url.startsWith('gopher:') || url.startsWith('ftp:')) {
        req.abort('accessdenied');
        return;
      }

      // Block cloud metadata & internal IP ranges
      if (
        url.includes('169.254.169.254') ||
        url.includes('metadata.google.internal') ||
        url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        url.includes('0.0.0.0') ||
        url.includes('::1')
      ) {
        req.abort('accessdenied');
        return;
      }

      req.continue();
    });
  }
}

export const browserService = new BrowserService();

