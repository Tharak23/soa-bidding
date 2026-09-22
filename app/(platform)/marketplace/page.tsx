import { api } from "@/lib/api";
import { AuctionGrid } from "@/components/auction-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Auction } from "@/lib/types";

export default async function MarketplacePage() {
  try {
    const auctions = await api<Auction[]>("/api/auctions");
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Open lots. Open a card to bid; the live price moves when anyone is outbid.</p>
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
