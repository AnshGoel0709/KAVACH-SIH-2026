/**
 * @file privacy.ts
 * Type definitions and branded contracts enforcing the Privacy Boundary in Drishti.
 *
 * ARCHITECTURAL INVARIANT:
 * RawBrowserFrame cannot be implicitly cast or passed to components requiring SanitizedFrame.
 * The vision layer strictly depends on SanitizedFrame.
 */

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type SensitiveCategory =
  | 'PII_NAME'
  | 'PII_EMAIL'
  | 'PII_PHONE'
  | 'PII_IDENTIFIER'
  | 'CREDENTIAL'
  | 'FINANCIAL'
  | 'HEALTH'
  | 'CUSTOM_SYNTHETIC';

export interface SensitiveRegion {
  readonly regionId: string;
  readonly category: SensitiveCategory;
  readonly boundingBox: BoundingBox;
  /** Cryptographic hash of the detected sensitive string (never store plaintext PII) */
  readonly contentHash: string;
  readonly confidence: number;
  readonly detectionMethod: 'DOM_TEXT_MATCH' | 'REGEX_HEURISTIC' | 'NER_MODEL' | 'OCR_CV';
}

export type RedactionMethod = 'SOLID_MASK' | 'BLUR' | 'SYNTHETIC_TOKEN';

export interface RedactionRecord {
  readonly regionId: string;
  readonly category: SensitiveCategory;
  readonly boundingBox: BoundingBox;
  readonly method: RedactionMethod;
  readonly appliedAt: number;
}

/**
 * Raw browser frame containing unredacted visual pixels directly from the browser viewport.
 * MUST NEVER reach the Vision/AI reasoning layer directly.
 */
export interface RawBrowserFrame {
  readonly _brand: 'RawBrowserFrame';
  readonly frameId: string;
  readonly timestamp: number;
  readonly imageBase64: string;
  readonly width: number;
  readonly height: number;
  readonly sourceUrl: string;
  readonly domTextSnapshot?: string;
}

/**
 * Sanitized browser frame that has passed through the Privacy Guard.
 * All sensitive regions have been masked, and a cryptographic verification digest is attached.
 * This is the ONLY frame format accepted by the Vision Engine.
 */
export interface SanitizedFrame {
  readonly _brand: 'SanitizedFrame';
  readonly frameId: string;
  readonly timestamp: number;
  readonly sanitizedImageBase64: string;
  readonly width: number;
  readonly height: number;
  readonly redactionsApplied: readonly RedactionRecord[];
  /** Cryptographic SHA-256 digest of sanitizedImageBase64 ensuring integrity */
  readonly verificationDigest: string;
  /** SHA-256 digest of raw frame for audit traceability without retaining raw pixels */
  readonly rawFrameDigest: string;
  readonly sanitizedAt: number;
  readonly privacyGuardVersion: string;
}

/**
 * Helper to construct a validated RawBrowserFrame
 */
export function createRawBrowserFrame(params: {
  frameId: string;
  imageBase64: string;
  width: number;
  height: number;
  sourceUrl: string;
  domTextSnapshot?: string;
}): RawBrowserFrame {
  return {
    _brand: 'RawBrowserFrame',
    frameId: params.frameId,
    timestamp: Date.now(),
    imageBase64: params.imageBase64,
    width: params.width,
    height: params.height,
    sourceUrl: params.sourceUrl,
    domTextSnapshot: params.domTextSnapshot,
  };
}

/**
 * Runtime type guard to verify that an object adheres to SanitizedFrame specification.
 */
export function isSanitizedFrame(frame: unknown): frame is SanitizedFrame {
  if (!frame || typeof frame !== 'object') return false;
  const f = frame as Partial<SanitizedFrame>;
  return (
    f._brand === 'SanitizedFrame' &&
    typeof f.frameId === 'string' &&
    typeof f.sanitizedImageBase64 === 'string' &&
    typeof f.verificationDigest === 'string' &&
    typeof f.rawFrameDigest === 'string' &&
    Array.isArray(f.redactionsApplied)
  );
}
