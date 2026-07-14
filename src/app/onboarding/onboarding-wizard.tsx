"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { completeOnboarding } from "./actions";

type DebtDraft = { name: string; balance: string; minPayment: string };

const emptyDebt = (): DebtDraft => ({ name: "", balance: "", minPayment: "" });

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [emergencyFund, setEmergencyFund] = useState("0");
  const [debts, setDebts] = useState<DebtDraft[]>([emptyDebt()]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateDebt(index: number, field: keyof DebtDraft, value: string) {
    setDebts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  }

  function addDebtRow() {
    setDebts((prev) => [...prev, emptyDebt()]);
  }

  function removeDebtRow(index: number) {
    setDebts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFinish() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding(
          Number(emergencyFund) || 0,
          debts
            .filter((d) => d.name.trim())
            .map((d) => ({
              name: d.name,
              balance: Number(d.balance) || 0,
              minPayment: Number(d.minPayment) || 0,
            })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <Card className="w-full max-w-lg">
        {step === 0 ? (
          <>
            <CardHeader>
              <CardTitle>Welcome to Baby Steps UK</CardTitle>
              <CardDescription>
                Step 1 is a £1,000 starter emergency fund. How much do you
                have saved already? (0 is fine — you&apos;ll build this up.)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ef">Starting emergency fund balance (£)</Label>
                <Input
                  id="ef"
                  type="number"
                  min="0"
                  step="0.01"
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.value)}
                />
              </div>
              <Button onClick={() => setStep(1)}>Next: Add your debts</Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Add any debts you&apos;re paying down</CardTitle>
              <CardDescription>
                Step 2 is the debt snowball. Add what you owe now — you can
                edit this anytime. Skip if you&apos;re debt-free.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {debts.map((debt, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label htmlFor={`debt-name-${i}`}>Name</Label>
                      <Input
                        id={`debt-name-${i}`}
                        placeholder="e.g. Credit card"
                        value={debt.name}
                        onChange={(e) =>
                          updateDebt(i, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex w-28 flex-col gap-1.5">
                      <Label htmlFor={`debt-balance-${i}`}>Balance (£)</Label>
                      <Input
                        id={`debt-balance-${i}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={debt.balance}
                        onChange={(e) =>
                          updateDebt(i, "balance", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex w-28 flex-col gap-1.5">
                      <Label htmlFor={`debt-min-${i}`}>Min payment</Label>
                      <Input
                        id={`debt-min-${i}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={debt.minPayment}
                        onChange={(e) =>
                          updateDebt(i, "minPayment", e.target.value)
                        }
                      />
                    </div>
                    {debts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDebtRow(i)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addDebtRow}>
                Add another debt
              </Button>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
                <Button onClick={handleFinish} disabled={isPending}>
                  {isPending ? "Setting up…" : "Finish setup"}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
