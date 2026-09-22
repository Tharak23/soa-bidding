import Link from "next/link";

import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { centsToDisplay } from "@/lib/money";
import type { Bid } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BidsPage() {
  try {
    const bids = await api<Bid[]>("/api/bids/me");
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">My bids</h1>
          <p className="text-sm text-muted-foreground">Every hold you placed on the floor.</p>
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    You have not bid yet.
                  </TableCell>
                </TableRow>
              ) : (
                bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{new Date(bid.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{bid.auctionId.slice(0, 8)}</TableCell>
                    <TableCell className="tabular">{centsToDisplay(bid.amountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{bid.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/auctions/${bid.auctionId}`}>Open lot</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <Alert variant="destructive">
            <AlertTitle>Bids unavailable</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Could not load bids."}
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>
    );
  }
}
