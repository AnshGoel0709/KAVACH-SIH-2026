/**
 * @file benchmark.ts
 * Frontend benchmark task definitions matching @drishti/core.
 */

export interface BenchmarkPreset {
  id: string;
  name: string;
  badge: string;
  prompt: string;
  routePath: string;
  targetActionLabel: string;
  targetSelector: string;
  expectedEntitiesCount: number;
  privacyScenario: 'FULL_REDACTION' | 'ZERO_REDACTION' | 'MIXED_POLICY_ALLOW' | 'HIGH_SENSITIVITY_CONSENT';
  requiresConsent?: boolean;
}

export const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: 'identity-verification',
    name: '1. Secure Identity Verification',
    badge: 'Scenario 1: Full Redaction',
    prompt: 'Locate the Continue Verification button and complete the identity verification.',
    routePath: '/demo/identity-verification',
    targetActionLabel: 'Continue Verification',
    targetSelector: '#btn-continue',
    expectedEntitiesCount: 4,
    privacyScenario: 'FULL_REDACTION',
  },
  {
    id: 'account-access',
    name: '2. Public Service Navigation',
    badge: 'Scenario 2: Zero Redaction',
    prompt: 'Find the Explore Public Services button and access the public service directory.',
    routePath: '/demo/account-access',
    targetActionLabel: 'Explore Public Services',
    targetSelector: '#btn-login',
    expectedEntitiesCount: 0,
    privacyScenario: 'ZERO_REDACTION',
  },
  {
    id: 'profile-management',
    name: '3. Private Profile Update',
    badge: 'Scenario 3: Mixed Policy',
    prompt: 'Open the profile editor and save the profile changes without exposing private information.',
    routePath: '/demo/profile-management',
    targetActionLabel: 'Save Profile',
    targetSelector: '#btn-save-profile',
    expectedEntitiesCount: 3,
    privacyScenario: 'MIXED_POLICY_ALLOW',
  },
  {
    id: 'document-review',
    name: '4. Sensitive Document Review',
    badge: 'Scenario 4: User Consent Gate',
    prompt: 'Open the protected document review and authenticate using the required access credential.',
    routePath: '/demo/document-review',
    targetActionLabel: 'Review Document',
    targetSelector: '#btn-review-doc',
    expectedEntitiesCount: 4,
    privacyScenario: 'HIGH_SENSITIVITY_CONSENT',
    requiresConsent: true,
  },
];

export function getBenchmarkPreset(id?: string): BenchmarkPreset {
  const found = BENCHMARK_PRESETS.find((p) => p.id === id);
  return found || BENCHMARK_PRESETS[0];
}
