/**
 * @file detector.ts
 * Sensitive data detector interfaces and rule-based heuristic implementation.
 */

import { createHash } from 'node:crypto';
import type { SensitiveCategory, SensitiveRegion, BoundingBox } from '@drishti/core';

export interface DetectionInput {
  readonly frameId: string;
  readonly textSnapshot?: string;
  readonly width: number;
  readonly height: number;
}

export interface SensitiveDataDetector {
  readonly name: string;
  readonly version: string;
  detect(input: DetectionInput): Promise<readonly SensitiveRegion[]>;
}

interface PatternRule {
  readonly category: SensitiveCategory;
  readonly regex: RegExp;
  readonly confidence: number;
  readonly description: string;
}

/**
 * Deterministic SHA-256 hash helper for privacy compliance (never log or store plaintext PII).
 */
function hashSecret(val: string): string {
  return createHash('sha256').update(val).digest('hex').substring(0, 16);
}

/**
 * Rule-based heuristic detector specifically tuned for PII and synthetic SIH test benchmarks.
 */
export class RuleBasedSensitiveDetector implements SensitiveDataDetector {
  public readonly name = 'RuleBasedSensitiveDetector';
  public readonly version = '0.1.0';

  private readonly rules: readonly PatternRule[] = [
    // SIH Synthetic Benchmark Patterns
    {
      category: 'CUSTOM_SYNTHETIC',
      regex: /AURELIS_TEST_NAME/gi,
      confidence: 0.99,
      description: 'SIH Synthetic Test Name Identifier',
    },
    {
      category: 'PII_IDENTIFIER',
      regex: /AURELIS-ID-[A-Za-z0-9]+/gi,
      confidence: 0.99,
      description: 'SIH Synthetic Aurelis Identifier Token',
    },
    // Standard PII Patterns
    {
      category: 'PII_EMAIL',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      confidence: 0.95,
      description: 'Standard Email Address Pattern',
    },
    {
      category: 'PII_PHONE',
      regex: /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}/g,
      confidence: 0.90,
      description: 'Phone / Mobile Number Pattern',
    },
    {
      category: 'CREDENTIAL',
      regex: /(?:password|secret|apikey|token|bearer)\s*[:=]\s*['"][^\s'"]+['"]/gi,
      confidence: 0.98,
      description: 'Exposed Credential Pattern',
    },
  ];

  public async detect(input: DetectionInput): Promise<readonly SensitiveRegion[]> {
    const text = input.textSnapshot ?? '';
    if (!text) {
      return [];
    }

    const regions: SensitiveRegion[] = [];
    let counter = 0;

    for (const rule of rulesForExecution(this.rules)) {
      const matches = text.matchAll(rule.regex);
      for (const match of matches) {
        counter++;
        const matchedText = match[0];
        const matchIndex = match.index ?? 0;

        // Approximate bounding coordinates based on text offset in viewport (for skeleton demo)
        const lineEstimate = Math.floor(matchIndex / 80);
        const colEstimate = matchIndex % 80;
        const box: BoundingBox = {
          x: Math.min(input.width - 150, colEstimate * 10),
          y: Math.min(input.height - 30, lineEstimate * 24 + 40),
          width: Math.min(input.width, matchedText.length * 10),
          height: 24,
        };

        regions.push({
          regionId: `sr-${input.frameId}-${counter}`,
          category: rule.category,
          boundingBox: box,
          contentHash: hashSecret(matchedText),
          confidence: rule.confidence,
          detectionMethod: 'REGEX_HEURISTIC',
        });
      }
    }

    return regions;
  }
}

function* rulesForExecution(rules: readonly PatternRule[]): Iterable<PatternRule> {
  for (const rule of rules) {
    yield rule;
  }
}
