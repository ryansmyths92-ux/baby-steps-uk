"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { advanceCurrentStep } from "./actions";
import type { BabyStep } from "@/lib/baby-steps";

export function CurrentStepCard({ step }: { step: BabyStep }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Step {step.number}: {step.title}
        </CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          disabled={isPending}
          onClick={() => startTransition(() => advanceCurrentStep())}
        >
          {isPending ? "Marking complete…" : `Mark Step ${step.number} complete`}
        </Button>
      </CardContent>
    </Card>
  );
}
