import { api } from "@/lib/api";
import { AuctionGrid } from "@/components/auction-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Auction } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MarketplacePage() {
  try {
    const auctions = await api<Auction[]>("/api/auctions");
    return (
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketplace</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Open lots. Open a card to bid; the live price moves when anyone is outbid.
            </p>
          </div>
        </div>
        <AuctionGrid auctions={auctions} />
      </div>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <Alert variant="destructive">
            <AlertTitle>Marketplace unavailable</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Could not load auctions."}
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>
    );
  }
}
