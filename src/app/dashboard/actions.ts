"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getCurrentStep } from "@/lib/progress";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function recordBalanceHistory(
  supabase: SupabaseServerClient,
  userId: string,
  sourceType: "account" | "debt",
  sourceId: string,
  balance: number,
) {
  await supabase.from("balance_history").insert({
    user_id: userId,
    source_type: sourceType,
    source_id: sourceId,
    balance,
  });
}

export async function advanceCurrentStep() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("step_number, status, completed_at")
    .eq("user_id", user.id)
    .order("step_number");

  const currentStep = getCurrentStep(progress ?? []);
  if (currentStep > 7) return;

  await supabase
    .from("user_progress")
    .update({ status: "complete", completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("step_number", currentStep);

  if (currentStep < 7) {
    await supabase
      .from("user_progress")
      .update({ status: "in_progress" })
      .eq("user_id", user.id)
      .eq("step_number", currentStep + 1);
  }

  revalidatePath("/dashboard");
}

export async function addDebt(input: {
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
  includeInSnowball: boolean;
}) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      name: input.name,
      balance: input.balance,
      min_payment: input.minPayment,
      interest_rate: input.interestRate,
      include_in_snowball: input.includeInSnowball,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add debt.");

  await recordBalanceHistory(supabase, user.id, "debt", data.id, input.balance);
  revalidatePath("/dashboard");
}

export async function updateDebtBalance(debtId: string, balance: number) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("debts")
    .update({ balance, updated_at: new Date().toISOString() })
    .eq("id", debtId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  await recordBalanceHistory(supabase, user.id, "debt", debtId, balance);
  revalidatePath("/dashboard");
}

export async function deleteDebt(debtId: string) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", debtId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function addAccount(input: {
  name: string;
  type: string;
  balance: number;
}) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      balance: input.balance,
    })
    .select("id")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Failed to add account.");

  await recordBalanceHistory(
    supabase,
    user.id,
    "account",
    data.id,
    input.balance,
  );
  revalidatePath("/dashboard");
}

export async function updateAccountBalance(
  accountId: string,
  balance: number,
) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("accounts")
    .update({ balance, updated_at: new Date().toISOString() })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  await recordBalanceHistory(supabase, user.id, "account", accountId, balance);
  revalidatePath("/dashboard");
}
