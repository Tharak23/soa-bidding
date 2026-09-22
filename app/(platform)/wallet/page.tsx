import { WalletPanel } from "@/components/wallet-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border bg-[radial-gradient(80%_120%_at_100%_0%,oklch(0.55_0.12_55_/_0.18),transparent_50%),linear-gradient(180deg,var(--card),var(--background))] p-6 sm:p-8">
        <div className="relative flex flex-col gap-1.5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">Ledger</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Wallet</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Top-ups credit available balance in ₹. Bids move funds into held until the lot closes.
          </p>
        </div>
      </div>
      <WalletPanel status={status} />
    </div>
  );
}
