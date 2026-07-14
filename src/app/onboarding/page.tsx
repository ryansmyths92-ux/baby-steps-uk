import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const { profile } = await requireUser();

  if (profile?.onboarded_at) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
