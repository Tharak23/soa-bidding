"use client";

import { centsToDisplay } from "@/lib/money";
import { useWallet } from "@/components/wallet-provider";

export function WalletTicker() {
  const { wallet } = useWallet();
  if (!wallet) {
    return <span className="text-sm text-muted-foreground">Wallet</span>;
  }
  return (
    <div className="ml-auto flex items-center gap-4 text-sm">
      <span>
        Available{" "}
        <span className="tabular font-semibold text-primary">
          {centsToDisplay(wallet.availableBalanceCents, wallet.currency)}
        </span>
      </span>
      <span className="text-muted-foreground">
        Held{" "}
        <span className="tabular font-medium">
          {centsToDisplay(wallet.heldBalanceCents, wallet.currency)}
        </span>
      </span>
    </div>
  );
}
