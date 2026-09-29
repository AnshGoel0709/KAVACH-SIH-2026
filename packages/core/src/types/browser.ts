/**
 * @file browser.ts
 * Contracts and interfaces for Browser automation, session state, and visual capture.
 */

import type { RawBrowserFrame } from './privacy.js';

export type BrowserActionType =
  | 'NAVIGATE'
  | 'CLICK'
  | 'TYPE'
  | 'SCROLL'
  | 'HOVER'
  | 'WAIT'
  | 'KEY_PRESS';

export interface BrowserAction {
  readonly actionId: string;
  readonly type: BrowserActionType;
  readonly selector?: string;
  readonly coordinates?: { readonly x: number; readonly y: number };
  readonly text?: string;
  readonly key?: string;
  readonly scrollDelta?: { readonly deltaX: number; readonly deltaY: number };
  readonly timeoutMs?: number;
  readonly description: string;
}

export interface BrowserActionResult {
  readonly actionId: string;
  readonly success: boolean;
  readonly executionTimeMs: number;
  readonly currentUrl: string;
  readonly error?: string;
}

export interface BrowserSessionState {
  readonly sessionId: string;
  readonly active: boolean;
  readonly currentUrl: string;
  readonly pageTitle: string;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly createdAt: number;
  readonly lastActiveAt: number;
}

/**
 * Interface representing the browser controller boundary.
 */
export interface BrowserAgentController {
  readonly isConnected: boolean;
  readonly isSimulated: boolean;

  launch(options?: { headless?: boolean }): Promise<BrowserSessionState>;
  navigateTo(url: string): Promise<void>;
  captureRawFrame(): Promise<RawBrowserFrame>;
  executeAction(action: BrowserAction): Promise<BrowserActionResult>;
  close(): Promise<void>;
}
