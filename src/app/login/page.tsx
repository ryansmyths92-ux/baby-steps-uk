"use client";

import { useActionState } from "react";
import Link from "next/link";
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
import {
  signInWithMagicLink,
  signInWithGoogle,
  type MagicLinkState,
} from "./actions";

const initialState: MagicLinkState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    signInWithMagicLink,
    initialState,
  );

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to Baby Steps UK</CardTitle>
          <CardDescription>
            No password needed — we&apos;ll email you a magic link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.success ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Check your inbox — we&apos;ve sent you a sign-in link.
            </p>
          ) : (
            <form action={formAction} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          )}

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            or
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            <Button variant="link" size="sm" render={<Link href="/" />}>
              Back to home
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
