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
    redirect("/marketplace");
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gavel className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight">BidVelocity</span>
        </div>
        <div className="flex items-center gap-2">
          <SignInButton forceRedirectUrl="/marketplace">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton forceRedirectUrl="/marketplace">
            <Button variant="outline">Create account</Button>
          </SignUpButton>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border bg-[radial-gradient(120%_80%_at_100%_0%,oklch(0.55_0.12_55_/_0.22),transparent_55%),linear-gradient(160deg,oklch(0.97_0.01_75),var(--card)_45%)] p-6 sm:p-10 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[repeating-linear-gradient(90deg,transparent,transparent_11px,oklch(0.55_0.12_55_/_0.07)_12px)]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col items-start gap-5">
              <Badge variant="outline" className="w-fit gap-2 bg-background/70 backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Floor is live · INR
              </Badge>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Fund once. Bid in rupees. Watch the hammer move.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Timed lots, a Dodo-funded wallet, and holds that lock as you bid. Close captures the winner — never a second card charge.
              </p>
              <div className="flex flex-wrap gap-2">
                <SignInButton forceRedirectUrl="/marketplace">
                  <Button size="lg" className="h-11 px-4">
                    Start bidding
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignInButton>
                <SignUpButton forceRedirectUrl="/marketplace">
                  <Button size="lg" variant="outline" className="h-11 px-4 bg-background/70">
                    Create account
                  </Button>
                </SignUpButton>
              </div>
              <dl className="grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
                <div className="bg-background/80 px-3 py-3 backdrop-blur">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Price sync</dt>
                  <dd className="mt-0.5 tabular text-lg font-bold">~1s</dd>
                </div>
                <div className="bg-background/80 px-3 py-3 backdrop-blur">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">At close</dt>
                  <dd className="mt-0.5 tabular text-lg font-bold">₹0 extra</dd>
                </div>
                <div className="bg-background/80 px-3 py-3 backdrop-blur">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Outbid</dt>
                  <dd className="mt-0.5 text-lg font-bold">Instant release</dd>
                </div>
              </dl>
            </div>

            <Card className="relative overflow-hidden shadow-xl ring-1 ring-primary/15">
              <div className="relative h-36 overflow-hidden bg-muted sm:h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <Badge className="absolute top-3 left-3">OPEN</Badge>
                <p className="absolute right-3 bottom-3 font-mono text-[11px] text-background/90">Lot · Leica M6</p>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-base">Live paddle</CardTitle>
                <CardDescription>Holds, not card-on-file at the hammer.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-end justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Current bid</p>
                    <p className="tabular text-3xl font-bold tracking-tight text-primary">₹ 85,000.00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Increment</p>
                    <p className="tabular text-sm font-bold">₹ 2,500.00</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Place a bid</p>
                      <p className="text-xs leading-5 text-muted-foreground">Must beat live price plus increment.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Wallet className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Wallet hold</p>
                      <p className="text-xs leading-5 text-muted-foreground">Funds lock from your ledger. Outbid holds release immediately.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Timer className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Clock expires</p>
                      <p className="text-xs leading-5 text-muted-foreground">One closer captures the winner and writes a unique settlement.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid items-stretch gap-4 sm:grid-cols-3">
          <Card className="h-full">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </span>
              <CardTitle>Clerk sessions</CardTitle>
              <CardDescription>JWT-secured calls through the API gateway. No passwords stored here.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Gavel className="h-4 w-4 text-primary" />
              </span>
              <CardTitle>Fair increments</CardTitle>
              <CardDescription>Ties never happen. The next bid is always strictly higher.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-4 w-4 text-primary" />
              </span>
              <CardTitle>Instant wallet credit</CardTitle>
              <CardDescription>Top up in INR via Dodo checkout. Available balance credits immediately.</CardDescription>
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
