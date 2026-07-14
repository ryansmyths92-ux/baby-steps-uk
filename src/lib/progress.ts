export type StepStatus = "not_started" | "in_progress" | "complete";

export type UserProgressRow = {
  step_number: number;
  status: StepStatus;
  completed_at: string | null;
};

/** The current step is the lowest-numbered step that isn't complete. */
export function getCurrentStep(progress: UserProgressRow[]): number {
  const active = progress
    .filter((p) => p.status !== "complete")
    .sort((a, b) => a.step_number - b.step_number)[0];
  return active?.step_number ?? 7;
}
