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
import { addAccount, updateAccountBalance } from "./actions";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

const TYPE_LABELS: Record<string, string> = {
  emergency_fund: "Emergency fund",
  savings: "Savings",
  investment: "Investment",
  pension: "Pension",
  other: "Other",
};

export function AccountsPanel({ accounts }: { accounts: Account[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("savings");
  const [balance, setBalance] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Record<string, string>>({});

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      await addAccount({ name: name.trim(), type, balance: Number(balance) || 0 });
      setName("");
      setBalance("");
      setShowAdd(false);
    });
  }

  function handleSave(id: string) {
    const value = Number(editing[id]);
    if (Number.isNaN(value)) return;
    startTransition(async () => {
      await updateAccountBalance(id, value);
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          Your emergency fund, savings, investments and pensions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="min-w-32 flex-1">
              <p className="text-sm font-medium">{account.name}</p>
              <p className="text-xs text-zinc-500">
                {TYPE_LABELS[account.type] ?? account.type}
              </p>
            </div>
            <Input
              className="w-28"
              type="number"
              step="0.01"
              value={editing[account.id] ?? account.balance}
              onChange={(e) =>
                setEditing((prev) => ({
                  ...prev,
                  [account.id]: e.target.value,
                }))
              }
            />
            {editing[account.id] !== undefined && (
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleSave(account.id)}
              >
                Save
              </Button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-account-name">Name</Label>
                <Input
                  id="new-account-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-account-type">Type</Label>
                <select
                  id="new-account-type"
                  className="h-8 rounded-lg border border-zinc-200 bg-background px-2 text-sm dark:border-zinc-800"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-account-balance">Balance (£)</Label>
                <Input
                  id="new-account-balance"
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button disabled={isPending} onClick={handleAdd}>
                Add account
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAdd(true)}>
            Add an account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
