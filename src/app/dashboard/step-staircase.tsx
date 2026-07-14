import { BABY_STEPS } from "@/lib/baby-steps";
import { cn } from "@/lib/utils";
import type { UserProgressRow } from "@/lib/progress";

export function StepStaircase({
  progress,
  currentStep,
}: {
  progress: UserProgressRow[];
  currentStep: number;
}) {
  const statusByStep = new Map(progress.map((p) => [p.step_number, p.status]));

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {BABY_STEPS.map((step) => {
        const status = statusByStep.get(step.number) ?? "not_started";
        const isCurrent = step.number === currentStep;
        return (
          <div
            key={step.number}
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-3 text-center transition-colors",
              status === "complete" &&
                "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
              isCurrent && "border-primary ring-2 ring-primary/30",
              status === "not_started" &&
                !isCurrent &&
                "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950",
            )}
          >
            <span className="text-xs font-medium">Step {step.number}</span>
            <span className="text-[11px] leading-tight">{step.title}</span>
            {status === "complete" && (
              <span aria-hidden className="text-lg">
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
