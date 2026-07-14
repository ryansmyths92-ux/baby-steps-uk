import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "./data";
import { getCurrentStep } from "@/lib/progress";
import { BABY_STEPS } from "@/lib/baby-steps";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { StepStaircase } from "./step-staircase";
import { CurrentStepCard } from "./current-step-card";
import { DebtsPanel } from "./debts-panel";
import { AccountsPanel } from "./accounts-panel";

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  if (!profile?.onboarded_at) {
    redirect("/onboarding");
  }

  const { progress, debts, accounts } = await getDashboardData(user.id);
  const currentStep = getCurrentStep(progress);
  const stepDetails =
    BABY_STEPS.find((s) => s.number === currentStep) ?? BABY_STEPS[0];

  const totalAssets = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const netWorth = totalAssets - totalDebt;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="text-sm text-zinc-500">
            Net worth: £
            {netWorth.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      <StepStaircase progress={progress} currentStep={currentStep} />
      <CurrentStepCard step={stepDetails} />
      <DebtsPanel debts={debts} />
      <AccountsPanel accounts={accounts} />
    </div>
  );
}
