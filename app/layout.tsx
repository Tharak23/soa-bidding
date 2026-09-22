import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

import "./globals.css";
import "./clerk.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BidVelocity",
  description: "Live marketplace auctions with a Dodo-funded wallet.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto =
    headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const allowedRedirectOrigins = Array.from(new Set(["http://localhost:3000", origin]));

  return (
    <html lang="en" className={`${dmSans.variable} ${dmSans.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider appearance={{ theme: shadcn }} allowedRedirectOrigins={allowedRedirectOrigins}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
