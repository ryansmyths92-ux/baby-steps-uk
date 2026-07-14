"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

type OnboardingDebt = {
  name: string;
  balance: number;
  minPayment: number;
};

export async function completeOnboarding(
  emergencyFundBalance: number,
  debts: OnboardingDebt[],
) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: "Emergency Fund",
      type: "emergency_fund",
      balance: emergencyFundBalance,
    })
    .select("id")
    .single();

  if (accountError || !account) {
    throw new Error(
      accountError?.message ?? "Failed to create emergency fund account.",
    );
  }

  await supabase.from("balance_history").insert({
    user_id: user.id,
    source_type: "account",
    source_id: account.id,
    balance: emergencyFundBalance,
  });

  const validDebts = debts.filter((d) => d.name.trim().length > 0);
  if (validDebts.length > 0) {
    const { data: insertedDebts, error: debtsError } = await supabase
      .from("debts")
      .insert(
        validDebts.map((d) => ({
          user_id: user.id,
          name: d.name.trim(),
          balance: d.balance,
          min_payment: d.minPayment,
        })),
      )
      .select("id, balance");

    if (debtsError) {
      throw new Error(debtsError.message);
    }

    if (insertedDebts) {
      await supabase.from("balance_history").insert(
        insertedDebts.map((d) => ({
          user_id: user.id,
          source_type: "debt" as const,
          source_id: d.id,
          balance: d.balance,
        })),
      );
    }
  }

  // Step 1 auto-completes if the £1,000 starter emergency fund is already met.
  if (emergencyFundBalance >= 1000) {
    await supabase
      .from("user_progress")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("step_number", 1);
    await supabase
      .from("user_progress")
      .update({ status: "in_progress" })
      .eq("user_id", user.id)
      .eq("step_number", 2);
  }

  await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect("/dashboard");
}
