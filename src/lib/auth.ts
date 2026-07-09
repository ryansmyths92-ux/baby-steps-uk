import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string | null;
  role: "client" | "admin";
  currency: string;
};

/** Data Access Layer entry point — memoized per request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, currency")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
});

export async function requireUser() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") redirect("/dashboard");
  return session;
}
