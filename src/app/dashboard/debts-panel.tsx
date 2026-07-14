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
import { addDebt, updateDebtBalance, deleteDebt } from "./actions";

type Debt = {
  id: string;
  name: string;
  balance: number;
  min_payment: number;
  interest_rate: number | null;
  include_in_snowball: boolean;
};

export function DebtsPanel({ debts }: { debts: Debt[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Record<string, string>>({});

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      await addDebt({
        name: name.trim(),
        balance: Number(balance) || 0,
        minPayment: Number(minPayment) || 0,
        interestRate: 0,
        includeInSnowball: true,
      });
      setName("");
      setBalance("");
      setMinPayment("");
      setShowAdd(false);
    });
  }

  function handleBalanceSave(id: string) {
    const value = Number(editing[id]);
    if (Number.isNaN(value)) return;
    startTransition(async () => {
      await updateDebtBalance(id, value);
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });
  }

  const sorted = [...debts].sort((a, b) => a.balance - b.balance);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt snowball</CardTitle>
        <CardDescription>
          Smallest balance first. Pay minimums on the rest, throw everything
          extra at the top of the list.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="text-sm text-zinc-500">
            No debts logged — nice, or add what you&apos;re paying down.
          </p>
        )}
        {sorted.map((debt, i) => (
          <div
            key={debt.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium dark:bg-zinc-800">
              {i + 1}
            </span>
            <div className="min-w-32 flex-1">
              <p className="text-sm font-medium">{debt.name}</p>
              <p className="text-xs text-zinc-500">
                Min payment £{debt.min_payment}
              </p>
            </div>
            <Input
              className="w-28"
              type="number"
              step="0.01"
              value={editing[debt.id] ?? debt.balance}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, [debt.id]: e.target.value }))
              }
            />
            {editing[debt.id] !== undefined && (
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleBalanceSave(debt.id)}
              >
                Save
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => startTransition(() => deleteDebt(debt.id))}
            >
              Paid off
            </Button>
          </div>
        ))}

        {showAdd ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-debt-name">Name</Label>
                <Input
                  id="new-debt-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-debt-balance">Balance (£)</Label>
                <Input
                  id="new-debt-balance"
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-debt-min">Min payment</Label>
                <Input
                  id="new-debt-min"
                  type="number"
                  step="0.01"
                  value={minPayment}
                  onChange={(e) => setMinPayment(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button disabled={isPending} onClick={handleAdd}>
                Add debt
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAdd(true)}>
            Add a debt
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
