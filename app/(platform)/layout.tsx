import { auth } from "@clerk/nextjs/server";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { WalletProvider } from "@/components/wallet-provider";
import { WalletTicker } from "@/components/wallet-ticker";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  return (
    <TooltipProvider>
      <WalletProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">Marketplace floor</span>
              <WalletTicker />
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </WalletProvider>
    </TooltipProvider>
  );
}
