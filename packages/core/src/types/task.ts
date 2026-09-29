/**
 * @file task.ts
 * Types for high-level goal decomposition, task planning, and lifecycle orchestration.
 */

import type { BrowserAction } from './browser.js';

export type TaskLifecycleState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'PLANNING'
  | 'CAPTURING_FRAME'
  | 'APPLYING_PRIVACY_GUARD'
  | 'VISION_REASONING'
  | 'EXECUTING_ACTION'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'HALTED_PRIVACY_VIOLATION';

export interface TaskGoal {
  readonly taskId: string;
  readonly prompt: string;
  readonly startingUrl?: string;
  readonly allowedDomains?: readonly string[];
  readonly maxSteps?: number;
  readonly createdAt: number;
}

export interface TaskStep {
  readonly stepNumber: number;
  readonly description: string;
  readonly plannedAction?: BrowserAction;
  readonly status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly verificationNotes?: string;
}

export interface TaskPlan {
  readonly planId: string;
  readonly taskId: string;
  readonly goal: string;
  readonly steps: readonly TaskStep[];
  readonly currentStepIndex: number;
  readonly state: TaskLifecycleState;
  readonly createdAt: number;
  readonly updatedAt: number;
}
