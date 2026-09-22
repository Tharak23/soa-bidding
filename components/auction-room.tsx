"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { BidForm } from "@/components/bid-form";
import { CancelAuctionButton } from "@/components/cancel-auction-button";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { nameFromClerk } from "@/lib/clerk-name";
import { gatewayFetch } from "@/lib/gateway";
import { centsToDisplay } from "@/lib/money";
import { createRealtimeClient } from "@/lib/supabase/browser";
import type { Auction, Bid } from "@/lib/types";

function collectedIds(auction: Auction, bids: Bid[]) {
  return [
    auction.leadingBidderClerkUserId,
    ...bids.map((bid) => bid.bidderClerkUserId),
  ].filter((id): id is string => Boolean(id));
}

function statusVariant(status: string) {
  if (status === "rejected") {
    return "destructive" as const;
  }
  if (status === "accepted" || status === "won") {
    return "default" as const;
  }
  return "secondary" as const;
}

export function AuctionRoom({
  auction: initialAuction,
  bids: initialBids,
  userId,
  names: initialNames,
}: {
  auction: Auction;
  bids: Bid[];
  userId: string | null;
  names: Record<string, string>;
}) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState(initialBids);
  const [names, setNames] = useState(initialNames);

  async function load() {
    const token = await getToken();
    const [nextAuction, nextBids] = await Promise.all([
      gatewayFetch<Auction>(`/api/auctions/${initialAuction.id}`, token),
      gatewayFetch<Bid[]>(`/api/auctions/${initialAuction.id}/bids`, token),
    ]);
    setAuction(nextAuction);
    setBids(nextBids);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load().catch(() => undefined);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAuction.id]);

  useEffect(() => {
    const client = createRealtimeClient();
    if (!client) {
      return;
    }
    const channel = client
      .channel(`lot-${initialAuction.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions", filter: `id=eq.${initialAuction.id}` },
        () => {
          void load().catch(() => undefined);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids", filter: `auction_id=eq.${initialAuction.id}` },
        () => {
          void load().catch(() => undefined);
        },
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAuction.id]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setNames((prev) => ({ ...prev, [user.id]: nameFromClerk(user) }));
  }, [user]);

  const missingIds = useMemo(() => {
    return [...new Set(collectedIds(auction, bids))].filter((id) => !names[id]);
  }, [auction, bids, names]);

  useEffect(() => {
    if (missingIds.length === 0) {
      return;
    }
    let cancelled = false;
    void fetch("/whois", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: missingIds }),
    })
      .then((res) => (res.ok ? res.json() : { names: {} }))
      .then((body: { names?: Record<string, string> }) => {
        if (cancelled || !body.names) {
          return;
        }
        setNames((prev) => ({ ...prev, ...body.names }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [missingIds]);

  const currency = "INR";
  const ended = auction.status !== "OPEN" || new Date(auction.endsAt).getTime() <= Date.now();
  const leadId = auction.leadingBidderClerkUserId;
  const leadName = leadId ? names[leadId] : null;
  const leadIsYou = Boolean(leadId && leadId === userId);

  function bidderLabel(clerkUserId: string) {
    const name = names[clerkUserId];
    if (!name) {
      return null;
    }
    return name;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_20rem]">
      <div className="flex flex-col gap-4">
        {auction.imageUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
            <Image
              src={auction.imageUrl}
              alt={auction.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 65vw"
              quality={90}
              priority
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{auction.title}</h1>
          <Badge variant="outline">{auction.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {auction.category ? <Badge variant="secondary">{auction.category}</Badge> : null}
          {auction.condition ? <span>{auction.condition}</span> : null}
          {auction.location ? <span>{auction.location}</span> : null}
        </div>
        <p className="text-sm leading-6">{auction.description || "No description"}</p>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Newest first. Outbid holds are released immediately.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No bids yet. First accepted bid sets the live price.
                    </TableCell>
                  </TableRow>
                ) : (
                  bids.map((bid) => {
                    const isLead = auction.leadingBidId === bid.id;
                    const isYou = bid.bidderClerkUserId === userId;
                    const name = bidderLabel(bid.bidderClerkUserId);
                    return (
                      <TableRow
                        key={bid.id}
                        className={isLead && bid.status === "accepted" ? "bg-primary/5" : undefined}
                      >
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(bid.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {name ? (
                              <span className="font-medium">{name}</span>
                            ) : (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                            {isYou ? (
                              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                                you
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="tabular">{centsToDisplay(bid.amountCents, currency)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant={statusVariant(bid.status)}>{bid.status}</Badge>
                            {isLead && bid.status === "accepted" ? (
                              <Badge variant="outline">lead</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Live bid</CardTitle>
            <CardDescription>Updates the moment another bid is accepted.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="tabular text-3xl font-bold text-primary">
                {centsToDisplay(auction.currentPriceCents, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time left</p>
              <Countdown endsAt={auction.endsAt} />
              <p className="text-xs text-muted-foreground">Ends {new Date(auction.endsAt).toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Increment {centsToDisplay(auction.minIncrementCents, currency)}
            </p>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">Lead</p>
              {leadId ? (
                <div className="flex min-w-0 items-center gap-1.5">
                  {leadName ? (
                    <p className="truncate text-sm font-medium">{leadName}</p>
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                  {leadIsYou ? (
                    <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                      you
                    </Badge>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No lead yet</p>
              )}
            </div>
            {userId === auction.sellerClerkUserId && auction.status === "OPEN" ? (
              <CancelAuctionButton auctionId={auction.id} />
            ) : null}
          </CardContent>
        </Card>
        {ended ? (
          <Card>
            <CardHeader>
              <CardTitle>Lot closed</CardTitle>
              <CardDescription>No further bids. Wallet capture or release already ran on close.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <BidForm auction={auction} onPlaced={() => void load()} />
        )}
      </div>
    </div>
  );
}
