/**
 * @file agent.controller.ts
 * Endpoints for controlling and inspecting the Drishti browser agent.
 */

import type { Request, Response } from 'express';
import { AgentOrchestrator } from '../services/agent-orchestrator.js';

const orchestrator = AgentOrchestrator.getInstance();

export function getAgentState(_req: Request, res: Response): void {
  res.status(200).json(orchestrator.getState());
}

export function resetAgentState(req: Request, res: Response): void {
  const { taskId } = req.body || {};
  orchestrator.reset(taskId);
  res.status(200).json({ success: true, state: orchestrator.getState() });
}

export function runAgentTask(req: Request, res: Response): void {
  const { taskId, taskPrompt, consentGiven } = req.body || {};
  const serverPort = (req.socket.localPort && req.socket.localPort > 0) ? req.socket.localPort : 3001;
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : serverPort;

  // Trigger task asynchronously in background
  orchestrator.runDemoTask({ taskId, taskPrompt, port, consentGiven }).catch((err) => {
    console.error('Agent execution uncaught error:', err);
  });

  // Immediately respond with the initial state
  res.status(200).json({
    initiated: true,
    message: 'Browser agent execution initiated.',
    state: orchestrator.getState(),
  });
}
