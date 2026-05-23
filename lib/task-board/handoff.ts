import {
  TASK_BOARD_ALLOWED_NEXT_STEPS,
  TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS,
  type TaskBoardAllowedNextStep,
  type TaskBoardForbiddenNextStep,
  type TaskCard,
  type TaskHandoff,
} from './types';

export function makeTaskCardContractBoundary(
  allowedNextStep: TaskBoardAllowedNextStep = 'prepare_draft_pr_instructions_only',
): Pick<
  TaskCard,
  | 'required_human_approval'
  | 'allowed_next_step'
  | 'forbidden_next_steps'
  | 'proposal_only'
  | 'is_production_state'
  | 'does_not_modify_api'
  | 'does_not_write_db'
  | 'does_not_run_migration'
  | 'does_not_deploy'
  | 'does_not_publish_externally'
> {
  assertAllowedNextStep(allowedNextStep);

  return {
    required_human_approval: true,
    allowed_next_step: allowedNextStep,
    forbidden_next_steps: makeTaskBoardForbiddenNextSteps(),
    proposal_only: true,
    is_production_state: false,
    does_not_modify_api: true,
    does_not_write_db: true,
    does_not_run_migration: true,
    does_not_deploy: true,
    does_not_publish_externally: true,
  };
}

export function makeTaskHandoffContractBoundary(
  allowedNextStep: TaskBoardAllowedNextStep = 'human_review_only',
): Pick<
  TaskHandoff,
  'human_approval_required' | 'allowed_next_step' | 'forbidden_next_steps'
> {
  assertAllowedNextStep(allowedNextStep);

  return {
    human_approval_required: true,
    allowed_next_step: allowedNextStep,
    forbidden_next_steps: makeTaskBoardForbiddenNextSteps(),
  };
}

export function makeTaskBoardForbiddenNextSteps(): TaskBoardForbiddenNextStep[] {
  return [...TASK_BOARD_REQUIRED_FORBIDDEN_NEXT_STEPS];
}

function assertAllowedNextStep(
  allowedNextStep: string,
): asserts allowedNextStep is TaskBoardAllowedNextStep {
  if (!TASK_BOARD_ALLOWED_NEXT_STEPS.includes(allowedNextStep as TaskBoardAllowedNextStep)) {
    throw new Error(`Unsupported Task Board allowed_next_step: ${allowedNextStep}`);
  }
}
