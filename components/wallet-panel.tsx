"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet-provider";
import { gatewayFetch } from "@/lib/gateway";
import { centsToDisplay, dollarsToCents } from "@/lib/money";
import type { Checkout } from "@/lib/types";

const LEDGER_LABELS: Record<string, string> = {
  top_up: "Top-up",
  hold: "Bid hold",
  release: "Hold released",
  capture: "Bid captured",
};

export function WalletPanel({ status }: { status?: string }) {
  const { getToken } = useAuth();
  const { wallet, ledger, loading, refresh } = useWallet();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(status === "success");

  useEffect(() => {
    if (status !== "success") {
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const startingAvailable = wallet?.availableBalanceCents ?? 0;

    async function confirm() {
      setConfirming(true);
      while (!cancelled && attempts < 8) {
        attempts += 1;
        const next = await refresh({ sync: true }).catch(() => null);
        if (next && next.availableBalanceCents > startingAvailable) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!cancelled) {
        setConfirming(false);
      }
    }

    confirm();
    return () => {
      cancelled = true;
    };
    // Confirm once when returning from Dodo; refresh/ledger are stable enough via attempts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function onTopUp(event: React.FormEvent) {
    event.preventDefault();
    const amountCents = dollarsToCents(amount);
    if (amountCents == null || amountCents < 1) {
      setError("Enter the amount you want to add.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const checkout = await gatewayFetch<Checkout>("/api/wallet/top-up", token, {
        method: "POST",
        body: JSON.stringify({ amountCents }),
      });
      window.location.href = checkout.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setSaving(false);
    }
  }

  const currency = wallet?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-4">
      {status === "success" ? (
        <Alert>
          <AlertTitle>{confirming ? "Confirming payment" : "Payment complete"}</AlertTitle>
          <AlertDescription>
            {confirming
              ? "Checking Dodo and updating available balance."
              : "Available balance now includes this top-up."}
          </AlertDescription>
        </Alert>
      ) : null}
      {status === "failed" ? (
        <Alert variant="destructive">
          <AlertTitle>Checkout did not complete</AlertTitle>
          <AlertDescription>No funds were credited. Try again from this page.</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
            <CardDescription>{currency}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="tabular text-2xl font-bold text-primary">
              {loading && !wallet ? "—" : centsToDisplay(wallet?.availableBalanceCents ?? 0, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Held</CardTitle>
            <CardDescription>Locked on open bids</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="tabular text-2xl font-bold">
              {loading && !wallet ? "—" : centsToDisplay(wallet?.heldBalanceCents ?? 0, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top up</CardTitle>
          <CardDescription>Type the amount to add. Dodo checkout charges that same amount.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onTopUp} className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Checkout failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <FieldDescription>
                  Enter the {currency} amount. Checkout shows this figure, not a product quantity.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={saving}>
              Continue to Dodo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  {loading ? "Loading ledger…" : "No ledger rows yet."}
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LEDGER_LABELS[entry.entryType] ?? entry.entryType}</Badge>
                  </TableCell>
                  <TableCell className="tabular">
                    {entry.entryType === "hold" ? "−" : ""}
                    {centsToDisplay(entry.amountCents, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button variant="ghost" size="sm" onClick={() => refresh({ sync: true })}>
        Refresh balances
      </Button>
    </div>
  );
}
