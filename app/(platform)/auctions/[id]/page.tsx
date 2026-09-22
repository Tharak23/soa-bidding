import { auth } from "@clerk/nextjs/server";

import { api } from "@/lib/api";
import { AuctionRoom } from "@/components/auction-room";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader } from "@/components/ui/card";
import type { Auction, Bid } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  try {
    const [auction, bids] = await Promise.all([
      api<Auction>(`/api/auctions/${id}`),
      api<Bid[]>(`/api/auctions/${id}/bids`),
    ]);
    return <AuctionRoom auction={auction} bids={bids} userId={userId} />;
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <Alert variant="destructive">
            <AlertTitle>Lot unavailable</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Could not load this auction."}
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>
    );
  }
}
