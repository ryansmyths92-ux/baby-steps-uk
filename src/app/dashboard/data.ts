import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [{ data: progress }, { data: debts }, { data: accounts }] =
    await Promise.all([
      supabase
        .from("user_progress")
        .select("step_number, status, completed_at")
        .eq("user_id", userId)
        .order("step_number"),
      supabase
        .from("debts")
        .select(
          "id, name, balance, min_payment, interest_rate, include_in_snowball",
        )
        .eq("user_id", userId)
        .order("balance", { ascending: true }),
      supabase
        .from("accounts")
        .select("id, name, type, balance")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]);

  return {
    progress: progress ?? [],
    debts: debts ?? [],
    accounts: accounts ?? [],
  };
}
