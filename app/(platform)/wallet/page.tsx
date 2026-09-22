import { WalletPanel } from "@/components/wallet-panel";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Top-ups credit available balance. Bids move funds into held until the lot closes.
        </p>
      </div>
      <WalletPanel status={status} />
    </div>
  );
}
