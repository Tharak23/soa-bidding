"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { gatewayFetch, GatewayError } from "@/lib/gateway";
import { centsToDisplay, dollarsToCents } from "@/lib/money";
import type { Auction, Bid } from "@/lib/types";
import { useWallet } from "@/components/wallet-provider";

export function BidForm({ auction, onPlaced }: { auction: Auction; onPlaced?: () => void }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { wallet, refresh } = useWallet();
  const minimum = auction.currentPriceCents + auction.minIncrementCents;
  const [amount, setAmount] = useState((minimum / 100).toFixed(2));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setAmount((minimum / 100).toFixed(2));
    }
  }, [minimum, dirty]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cents = dollarsToCents(amount);
    if (cents == null) {
      setError("Enter a valid amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      await gatewayFetch<Bid>("/api/bids", token, {
        method: "POST",
        body: JSON.stringify({ auctionId: auction.id, amountCents: cents }),
      });
      setDirty(false);
      await refresh();
      onPlaced?.();
      router.refresh();
    } catch (err) {
      if (
        err instanceof GatewayError &&
        (err.code === "insufficient_funds" || err.message.toLowerCase().includes("wallet cannot cover"))
      ) {
        setError("INSUFFICIENT_FUNDS");
      } else {
        setError(err instanceof Error ? err.message : "Bid rejected");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place a bid</CardTitle>
        <CardDescription>
          Minimum {centsToDisplay(minimum, wallet?.currency)}. Wallet hold is the bid amount; a
          previous lead is released if you take the lead.
          {wallet
            ? ` Available ${centsToDisplay(wallet.availableBalanceCents, wallet.currency)}.`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error === "INSUFFICIENT_FUNDS" ? (
            <Alert variant="destructive">
              <AlertTitle>Hold rejected</AlertTitle>
              <AlertDescription>
                Top up your wallet, then return to this lot.
                <Button asChild variant="link" className="h-auto px-1">
                  <a href="/wallet">Open wallet</a>
                </Button>
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Bid not accepted</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bid">Amount ({wallet?.currency ?? "INR"})</FieldLabel>
              <Input
                id="bid"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setDirty(true);
                  setAmount(event.target.value);
                }}
              />
              <FieldDescription>Must beat the live price by at least the increment.</FieldDescription>
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={saving || auction.status !== "OPEN"}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Placing…" : "Bid"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
