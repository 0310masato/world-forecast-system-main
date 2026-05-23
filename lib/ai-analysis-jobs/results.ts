import {
  AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP,
  AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS,
  AI_ANALYSIS_JOB_RESULT_REQUIRED_SAFETY_LABELS,
  type AIAnalysisJobResultBoundary,
  type AIAnalysisJobResultSafetyLabel,
} from './types';

export function makeAIAnalysisJobResultBoundary(): AIAnalysisJobResultBoundary {
  return {
    requires_human_approval: true,
    allowed_next_step: AI_ANALYSIS_JOB_ALLOWED_NEXT_STEP,
    forbidden_next_steps: [...AI_ANALYSIS_JOB_FORBIDDEN_NEXT_STEPS],
    proposal_only: true,
    is_production_state: false,
  };
}

export function makeAIAnalysisJobResultSafetyLabels(): AIAnalysisJobResultSafetyLabel[] {
  return [...AI_ANALYSIS_JOB_RESULT_REQUIRED_SAFETY_LABELS];
}
