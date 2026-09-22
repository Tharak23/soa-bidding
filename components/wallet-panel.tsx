"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ArrowDownToLine, History, Loader2, Lock, Plus, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

const LEDGER_LABELS: Record<string, string> = {
  top_up: "Top-up",
  hold: "Bid hold",
  release: "Hold released",
  capture: "Bid captured",
};

const QUICK_AMOUNTS = ["500", "1000", "2500", "5000", "10000"];

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

  const currency = wallet?.currency ?? "INR";
  const available = wallet?.availableBalanceCents ?? 0;
  const held = wallet?.heldBalanceCents ?? 0;
  const total = available + held;
  const heldShare = useMemo(() => {
    if (total <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((held / total) * 100));
  }, [held, total]);

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
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card shadow-sm">
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                  <Wallet className="h-4 w-4 text-primary" />
                </span>
                <CardTitle className="text-sm font-bold">Available</CardTitle>
              </div>
              <Badge variant="outline" className="bg-background/60 text-[11px]">
                {currency}
              </Badge>
            </div>
            <CardDescription>Ready to bid</CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-3">
            <p className="tabular text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {loading && !wallet ? "—" : centsToDisplay(available, currency)}
            </p>
            <div>
              <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>Available</span>
                <span>Held {heldShare}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: total <= 0 ? "100%" : `${Math.max(0, 100 - heldShare)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </span>
              <CardTitle className="text-sm font-bold">Held</CardTitle>
            </div>
            <CardDescription>Locked on open bids</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="tabular text-3xl font-bold tracking-tight sm:text-4xl">
              {loading && !wallet ? "—" : centsToDisplay(held, currency)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Releases instantly when you&apos;re outbid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </span>
              <div>
                <CardTitle>Top up</CardTitle>
                <CardDescription>Dodo checkout charges this exact amount in ₹.</CardDescription>
              </div>
            </div>
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
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="500.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-11 pl-7 text-base tabular"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_AMOUNTS.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={amount === value || amount === `${value}.00` ? "default" : "outline"}
                        onClick={() => setAmount(value)}
                      >
                        ₹{Number(value).toLocaleString("en-IN")}
                      </Button>
                    ))}
                  </div>
                  <FieldDescription>Checkout shows this figure, not a product quantity.</FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={saving} size="lg" className="h-11 w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                {saving ? "Opening checkout…" : "Continue to Dodo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <CardTitle>Ledger</CardTitle>
                  <CardDescription>Newest activity first</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refresh({ sync: true })}>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-hidden border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                        {loading ? "Loading ledger…" : "No ledger rows yet. Top up to fund your first bid."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledger.map((entry) => {
                      const debit = entry.entryType === "hold" || entry.entryType === "capture";
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(entry.createdAt).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[11px]">
                              {LEDGER_LABELS[entry.entryType] ?? entry.entryType}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`tabular text-right font-bold ${
                              debit ? "text-muted-foreground" : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {debit ? "−" : "+"}
                            {centsToDisplay(entry.amountCents, currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
