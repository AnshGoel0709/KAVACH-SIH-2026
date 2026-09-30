/**
 * @file playwright-agent.ts
 * Real Playwright browser controller for Drishti browser automation.
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import {
  type BrowserAgentController,
  type BrowserSessionState,
  type BrowserAction,
  type BrowserActionResult,
  type RawBrowserFrame,
  createRawBrowserFrame,
} from '@drishti/core';

export class PlaywrightBrowserAgent implements BrowserAgentController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private sessionId: string = '';
  private currentUrlStr: string = 'about:blank';
  private frameCounter: number = 0;

  public get isConnected(): boolean {
    return this.page !== null && !this.page.isClosed();
  }

  public get isInitialized(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null && !this.page.isClosed();
  }

  public get isPageAvailable(): boolean {
    return this.page !== null && !this.page.isClosed();
  }

  public readonly isSimulated = false;

  public async launch(options?: { headless?: boolean }): Promise<BrowserSessionState> {
    const headless = options?.headless ?? true;
    this.sessionId = `session-${Date.now().toString(36)}`;

    this.browser = await chromium.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    this.page = await this.context.newPage();
    this.currentUrlStr = 'about:blank';

    return {
      sessionId: this.sessionId,
      active: true,
      currentUrl: this.currentUrlStr,
      pageTitle: 'New Session',
      viewport: { width: 1280, height: 800 },
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  }

  public async navigateTo(url: string): Promise<void> {
    if (!this.isPageAvailable || !this.page) {
      throw new Error('Browser lifecycle error: Browser page is not available. Call launch() first.');
    }
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    this.currentUrlStr = url;
    // Brief settle time for animations/DOM updates
    await this.page.waitForTimeout(100);
  }

  public async captureRawFrame(): Promise<RawBrowserFrame> {
    if (!this.isPageAvailable || !this.page) {
      throw new Error('Browser lifecycle error: Cannot capture frame. Browser page is not available.');
    }

    this.frameCounter++;
    const frameId = `frame-${this.sessionId}-${this.frameCounter}`;

    // Capture visual screenshot as JPEG base64
    const screenshotBuffer = await this.page.screenshot({
      type: 'jpeg',
      quality: 85,
    });
    const imageBase64 = screenshotBuffer.toString('base64');

    // Extract text content and sensitive DOM bounding boxes for privacy guard analysis
    const pageData = await this.page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const boxes: Array<{
        category: 'CUSTOM_SYNTHETIC' | 'PII_EMAIL' | 'PII_PHONE' | 'PII_IDENTIFIER' | 'PII_NAME' | 'CREDENTIAL';
        text: string;
        box: { x: number; y: number; width: number; height: number };
      }> = [];

      // Query all elements with data-sensitive attribute or standard field IDs
      const selector = '[data-sensitive], #field-name, #field-email, #field-phone, #field-identifier, #f-name, #f-email, #f-phone, #f-id, #f-fullname, #f-docnum, #f-officer, #f-key, .field-box';
      const elements = document.querySelectorAll(selector);

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const sensitiveAttr = el.getAttribute('data-sensitive');
          const id = el.id || '';
          let category: 'CUSTOM_SYNTHETIC' | 'PII_EMAIL' | 'PII_PHONE' | 'PII_IDENTIFIER' | 'PII_NAME' | 'CREDENTIAL' = 'CUSTOM_SYNTHETIC';

          if (sensitiveAttr) {
            category = sensitiveAttr as any;
          } else if (id.includes('email') || id === 'f-email') {
            category = 'PII_EMAIL';
          } else if (id.includes('phone') || id === 'f-phone') {
            category = 'PII_PHONE';
          } else if (id.includes('fullname') || id.includes('name') || id === 'f-name' || id === 'f-officer') {
            category = id.includes('fullname') || id.includes('officer') ? 'PII_NAME' : 'CUSTOM_SYNTHETIC';
          } else if (id.includes('id') || id.includes('docnum') || id === 'f-id') {
            category = 'PII_IDENTIFIER';
          } else if (id.includes('key') || id === 'f-key') {
            category = 'CREDENTIAL';
          } else {
            // Check text heuristic
            const t = el.textContent || '';
            if (t.includes('@')) category = 'PII_EMAIL';
            else if (/\+?\d{10}/.test(t)) category = 'PII_PHONE';
            else if (/AURELIS-ID|AURELIS-DOC/.test(t)) category = 'PII_IDENTIFIER';
            else if (/SEC-KEY/.test(t)) category = 'CREDENTIAL';
            else if (/AURELIS_TEST_NAME/.test(t)) category = 'CUSTOM_SYNTHETIC';
          }

          boxes.push({
            category,
            text: (el as HTMLElement).innerText || el.textContent || '',
            box: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          });
        }
      });
      return { text, boxes };
    });

    return createRawBrowserFrame({
      frameId,
      imageBase64,
      width: 1280,
      height: 800,
      sourceUrl: this.page.url(),
      domTextSnapshot: pageData.text,
      detectedDomBoxes: pageData.boxes,
    });
  }

  /**
   * Applies real solid pixel redaction over sensitive bounding boxes using in-browser canvas.
   */
  public async applyPixelRedaction(
    rawImageBase64: string,
    boxes: readonly { x: number; y: number; width: number; height: number }[]
  ): Promise<string> {
    if (!this.page || this.page.isClosed()) {
      return rawImageBase64;
    }

    try {
      return await this.page.evaluate(
        async ({ base64, rects }) => {
          return new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(base64);

                ctx.drawImage(img, 0, 0);

                for (const r of rects) {
                  const padX = 4;
                  const padY = 2;
                  const x = Math.max(0, r.x - padX);
                  const y = Math.max(0, r.y - padY);
                  const w = r.width + padX * 2;
                  const h = r.height + padY * 2;

                  // 1. Solid opaque privacy mask (near black)
                  ctx.fillStyle = '#06090e';
                  ctx.fillRect(x, y, w, h);

                  // 2. High-contrast security boundary border (emerald)
                  ctx.strokeStyle = '#10b981';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(x, y, w, h);

                  // 3. Redaction text indicator
                  ctx.fillStyle = '#10b981';
                  ctx.font = 'bold 12px monospace';
                  ctx.textBaseline = 'middle';
                  ctx.fillText('[REDACTED: PII]', x + 10, y + h / 2);
                }

                const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
                const parts = dataUrl.split(',');
                resolve(parts[1] || base64);
              } catch {
                resolve(base64);
              }
            };
            img.onerror = () => resolve(base64);
            img.src = 'data:image/jpeg;base64,' + base64;
          });
        },
        { base64: rawImageBase64, rects: boxes }
      );
    } catch {
      return rawImageBase64;
    }
  }

  public async executeAction(action: BrowserAction): Promise<BrowserActionResult> {
    if (!this.isPageAvailable || !this.page) {
      throw new Error('Browser lifecycle error: Cannot execute action. Browser page is not available.');
    }

    const startTime = performance.now();

    try {
      if (action.type === 'CLICK') {
        if (action.selector) {
          await this.page.waitForSelector(action.selector, { timeout: 5000 });
          await this.page.click(action.selector);
        } else if (action.coordinates) {
          await this.page.mouse.click(action.coordinates.x, action.coordinates.y);
        } else {
          throw new Error('Click action requires either a selector or coordinates.');
        }
      } else if (action.type === 'TYPE') {
        if (action.selector && action.text) {
          await this.page.fill(action.selector, action.text);
        }
      } else if (action.type === 'SCROLL') {
        if (action.scrollDelta) {
          await this.page.mouse.wheel(action.scrollDelta.deltaX, action.scrollDelta.deltaY);
        }
      } else if (action.type === 'WAIT') {
        await this.page.waitForTimeout(action.timeoutMs ?? 500);
      }

      // Settle time for DOM reaction
      await this.page.waitForTimeout(400);

      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        actionId: action.actionId,
        success: true,
        executionTimeMs: elapsed,
        currentUrl: this.page.url(),
      };
    } catch (err: unknown) {
      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        actionId: action.actionId,
        success: false,
        executionTimeMs: elapsed,
        currentUrl: this.page.url(),
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  public async getPageStatusAttribute(): Promise<string | null> {
    if (!this.page) return null;
    return await this.page.evaluate(() => {
      const el = document.getElementById('form-container');
      return el ? el.getAttribute('data-status') : null;
    });
  }

  public async close(): Promise<void> {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(() => {});
      }
      if (this.context) {
        await this.context.close().catch(() => {});
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
      }
    } catch {
      // Ignore cleanup error
    } finally {
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
