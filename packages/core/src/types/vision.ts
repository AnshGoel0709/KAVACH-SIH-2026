/**
 * @file vision.ts
 * Interfaces and contracts for the Vision reasoning layer.
 *
 * ARCHITECTURAL INVARIANT:
 * VisionEngine strictly consumes SanitizedFrame.
 * No method shall accept RawBrowserFrame.
 */

import type { BoundingBox, SanitizedFrame } from './privacy.js';

export interface VisionGoalPrompt {
  readonly goal: string;
  readonly contextHints?: readonly string[];
  readonly targetElementDescription?: string;
  readonly allowedActions?: readonly ('CLICK' | 'TYPE' | 'SCROLL' | 'HOVER' | 'NAVIGATE')[];
}

export interface DetectedVisualElement {
  readonly elementId: string;
  readonly label: string;
  readonly boundingBox: BoundingBox;
  readonly confidence: number;
  readonly interactivityType: 'BUTTON' | 'INPUT' | 'LINK' | 'NAV_ITEM' | 'STATIC_TEXT' | 'UNKNOWN';
}

export interface RecommendedAction {
  readonly actionType: 'CLICK' | 'TYPE' | 'SCROLL' | 'HOVER' | 'NAVIGATE' | 'TASK_COMPLETE' | 'TASK_FAIL';
  readonly targetElementId?: string;
  readonly targetCoordinates?: { readonly x: number; readonly y: number };
  readonly valueToType?: string;
  readonly rationale: string;
  readonly confidence: number;
}

export interface VisionAnalysisResult {
  readonly frameId: string;
  readonly analyzedAt: number;
  readonly engineId: string;
  readonly isSimulated: boolean;
  readonly visualSummary: string;
  readonly detectedElements: readonly DetectedVisualElement[];
  readonly recommendedAction: RecommendedAction;
  readonly rawFrameBypassed: false; // Explicit proof flag: always false
  readonly verifiedSanitizedDigest: string;
}

/**
 * Contract that all Vision Engines (production models or simulation skeletons) must implement.
 */
export interface VisionEngine {
  readonly engineId: string;
  readonly version: string;
  readonly isSimulated: boolean;

  /**
   * Process ONLY a sanitized visual frame.
   * Passing RawBrowserFrame will result in a compile-time TypeScript error.
   */
  processSanitizedFrame(
    frame: SanitizedFrame,
    prompt: VisionGoalPrompt
  ): Promise<VisionAnalysisResult>;
}
