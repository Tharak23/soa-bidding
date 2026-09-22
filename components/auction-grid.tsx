"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { gatewayFetch } from "@/lib/gateway";
import { centsToDisplay } from "@/lib/money";
import { createRealtimeClient } from "@/lib/supabase/browser";
import type { Auction } from "@/lib/types";

export function AuctionGrid({ auctions }: { auctions: Auction[] }) {
  const { getToken } = useAuth();
  const [lots, setLots] = useState(auctions);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLots(auctions);
  }, [auctions]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const token = await getToken();
        setLots(await gatewayFetch<Auction[]>("/api/auctions", token));
      } catch {
        return;
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [getToken]);

  useEffect(() => {
    const client = createRealtimeClient();
    if (!client) {
      return;
    }
    const channel = client
      .channel("marketplace")
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, () => {
        void (async () => {
          try {
            const token = await getToken();
            setLots(await gatewayFetch<Auction[]>("/api/auctions", token));
          } catch {
            return;
          }
        })();
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [getToken]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return lots;
    }
    return lots.filter(
      (auction) =>
        auction.title.toLowerCase().includes(q) ||
        (auction.description ?? "").toLowerCase().includes(q) ||
        (auction.category ?? "").toLowerCase().includes(q),
    );
  }, [lots, query]);

  return (
    <div className="flex flex-col gap-4">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter lots" />
      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No open lots</CardTitle>
            <CardDescription>List an item from Sell, or wait for the next drop.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((auction) => (
            <Card key={auction.id} className="overflow-hidden">
              {auction.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={auction.imageUrl} alt="" className="h-40 w-full object-cover" />
              ) : null}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-bold">{auction.title}</CardTitle>
                  <Badge>{auction.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {auction.category ? `${auction.category} · ` : ""}
                  {auction.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Current bid</p>
                    <p className="tabular font-bold text-primary">
                      {centsToDisplay(auction.currentPriceCents)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Time left</p>
                    <Countdown endsAt={auction.endsAt} />
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/auctions/${auction.id}`}>Open lot</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
