"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

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
import { gatewayFetch } from "@/lib/gateway";
import { centsToDisplay } from "@/lib/money";
import { createRealtimeClient } from "@/lib/supabase/browser";
import type { Auction, Bid } from "@/lib/types";

export function AuctionRoom({
  auction: initialAuction,
  bids: initialBids,
  userId,
}: {
  auction: Auction;
  bids: Bid[];
  userId: string | null;
}) {
  const { getToken } = useAuth();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState(initialBids);

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

  const currency = "USD";
  const ended = auction.status !== "OPEN" || new Date(auction.endsAt).getTime() <= Date.now();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_20rem]">
      <div className="flex flex-col gap-4">
        {auction.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-foreground/10"
          />
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
                  bids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>{new Date(bid.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {bid.bidderClerkUserId === userId ? "You" : bid.bidderClerkUserId.slice(0, 12)}
                      </TableCell>
                      <TableCell className="tabular">{centsToDisplay(bid.amountCents, currency)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{bid.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
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
              {auction.leadingBidderClerkUserId
                ? ` · Lead ${auction.leadingBidderClerkUserId === userId ? "you" : auction.leadingBidderClerkUserId.slice(0, 12)}`
                : " · No lead yet"}
            </p>
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
