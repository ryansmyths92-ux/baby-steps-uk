import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <p className="text-sm text-zinc-500">
        Your 7-step progress tracker, debt snowball, and achievements land
        here in the next build phase.
      </p>
    </div>
  );
}
