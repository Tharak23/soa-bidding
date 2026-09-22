"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { gatewayFetch } from "@/lib/gateway";
import { useWallet } from "@/components/wallet-provider";

export function CancelAuctionButton({ auctionId }: { auctionId: string }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { refresh } = useWallet();
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    try {
      const token = await getToken();
      await gatewayFetch<null>(`/api/auctions/${auctionId}/cancel`, token, { method: "POST" });
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel listing</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this lot?</AlertDialogTitle>
          <AlertDialogDescription>
            Allowed only before any bid is accepted. {error}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep listing</AlertDialogCancel>
          <AlertDialogAction onClick={cancel}>Cancel listing</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
