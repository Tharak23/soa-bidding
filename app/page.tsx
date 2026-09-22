import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowRight, Gavel, ShieldCheck, Timer, Wallet, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function LandingPage() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    redirect("/onboard");
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gavel className="h-4 w-4" />
          </span>
          <span className="font-bold">BidVelocity</span>
        </div>
        <div className="flex items-center gap-2">
          <SignInButton forceRedirectUrl="/onboard">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton forceRedirectUrl="/onboard">
            <Button variant="outline">Create account</Button>
          </SignUpButton>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit">
              Live copper-line auctions
            </Badge>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
              Bid with a funded wallet. Watch the price move in real time.
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              BidVelocity is a marketplace for timed listings. Top up once with Dodo, hold funds as you bid, and let close capture the winner — never a second card charge.
            </p>
            <div className="flex flex-wrap gap-2">
              <SignInButton forceRedirectUrl="/onboard">
                <Button size="lg">
                  Start bidding
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/onboard">
                <Button size="lg" variant="secondary">
                  Join the floor
                </Button>
              </SignUpButton>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How a lot closes</CardTitle>
              <CardDescription>Holds, not card-on-file at the hammer.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Zap className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-bold">Place a bid</p>
                  <p className="text-sm text-muted-foreground">The next amount must beat the live price plus increment.</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-bold">Wallet hold</p>
                  <p className="text-sm text-muted-foreground">Funds lock from your ledger. Outbid holds release immediately.</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Timer className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-bold">Clock expires</p>
                  <p className="text-sm text-muted-foreground">One closer captures the winner and writes a unique settlement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle>Clerk sessions</CardTitle>
              <CardDescription>JWT-secured calls through the API gateway. No passwords stored here.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Gavel className="h-4 w-4 text-primary" />
              <CardTitle>Fair increments</CardTitle>
              <CardDescription>Ties never happen. The next bid is always strictly higher.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Wallet className="h-4 w-4 text-primary" />
              <CardTitle>Dodo top-up</CardTitle>
              <CardDescription>Product pdt_0No8GYiVeUpU21JfBYefp credits available balance once per payment.</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <span>BidVelocity marketplace</span>
        <Button variant="link" asChild>
          <Link href="/sign-in">Enter the floor</Link>
        </Button>
      </footer>
    </div>
  );
}
