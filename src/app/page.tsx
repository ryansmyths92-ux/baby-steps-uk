import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BABY_STEPS } from "@/lib/baby-steps";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">
          Baby Steps UK
        </span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button render={<Link href="/login" />}>Get started</Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-12">
        <section className="flex flex-col items-center gap-6 py-12 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Your journey to financial peace, the UK way.
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Track your progress through the 7 Baby Steps — from your first
            £1,000 emergency fund to building lasting wealth. No bank
            linking, no spreadsheets. Just clear, gamified progress.
          </p>
          <Button size="lg" render={<Link href="/login" />}>
            Start your first step
          </Button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BABY_STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="text-sm font-medium text-zinc-500">
                Step {step.number}
              </span>
              <h2 className="text-base font-semibold">{step.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-zinc-500">
        Baby Steps UK — built for tracking, not banking. Your data stays
        yours.
      </footer>
    </div>
  );
}
