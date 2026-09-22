"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { gatewayFetch } from "@/lib/gateway";
import type { LedgerEntry, Wallet } from "@/lib/types";

type WalletContextValue = {
  wallet: Wallet | null;
  ledger: LedgerEntry[];
  loading: boolean;
  refresh: (opts?: { sync?: boolean }) => Promise<Wallet | null>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const pathname = usePathname();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async (opts?: { sync?: boolean }) => {
      const token = await getToken();
      if (opts?.sync) {
        await gatewayFetch<Wallet>("/api/wallet/sync", token, { method: "POST" }).catch(() => null);
      }
      const [nextWallet, nextLedger] = await Promise.all([
        gatewayFetch<Wallet>("/api/wallet", token),
        gatewayFetch<LedgerEntry[]>("/api/wallet/ledger", token),
      ]);
      setWallet(nextWallet);
      setLedger(nextLedger);
      setLoading(false);
      return nextWallet;
    },
    [getToken],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    refresh({ sync: pathname.startsWith("/wallet") }).catch(() => setLoading(false));
  }, [isLoaded, pathname, refresh]);

  const value = useMemo(
    () => ({ wallet, ledger, loading, refresh }),
    [wallet, ledger, loading, refresh],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
