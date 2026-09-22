"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { createRealtimeClient } from "@/lib/supabase/browser";
import { centsToDisplay } from "@/lib/money";
import type { Auction } from "@/lib/types";

export function LivePrice({ auction }: { auction: Auction }) {
  const [price, setPrice] = useState(auction.currentPriceCents);
  const [status, setStatus] = useState(auction.status);

  useEffect(() => {
    setPrice(auction.currentPriceCents);
    setStatus(auction.status);
  }, [auction.currentPriceCents, auction.status]);

  useEffect(() => {
    const client = createRealtimeClient();
    if (!client) return;
    const channel = client
      .channel(`auction-${auction.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${auction.id}`,
        },
        (payload) => {
          const next = payload.new as {
            current_price_cents?: number;
            status?: Auction["status"];
          };
          if (typeof next.current_price_cents === "number") {
            setPrice(next.current_price_cents);
          }
          if (next.status) {
            setStatus(next.status);
          }
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [auction.id]);

  return (
    <div className="flex items-center gap-2">
      <span className="tabular text-2xl font-bold text-primary">{centsToDisplay(price)}</span>
      <Badge>{status}</Badge>
    </div>
  );
}
