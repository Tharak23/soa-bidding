"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { gatewayFetch } from "@/lib/gateway";
import { centsToDisplay, dollarsToCents } from "@/lib/money";
import type { Auction } from "@/lib/types";
import { Clock, ImageIcon, Info, Loader2, MapPin, Package, Tag } from "lucide-react";

const CATEGORIES = ["Cameras", "Watches", "Instruments", "Books", "Sneakers", "Furniture", "Art", "Other"];
const CONDITIONS = ["New", "Used - Excellent", "Used - Very Good", "Used - Good", "Used - Fair"];
const DURATIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function SellPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("Used - Good");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBroken, setImageBroken] = useState(false);
  const [startPrice, setStartPrice] = useState("1000.00");
  const [increment, setIncrement] = useState("100.00");
  const [hours, setHours] = useState("24");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startCents = dollarsToCents(startPrice);
  const incrementCents = dollarsToCents(increment);
  const durationLabel = DURATIONS.find((item) => String(item.hours) === hours)?.label ?? `${hours}h`;
  const showImage = Boolean(imageUrl) && !imageBroken;

  const previewTitle = useMemo(() => title.trim() || "Your lot title", [title]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const startPriceCents = dollarsToCents(startPrice);
    const minIncrementCents = dollarsToCents(increment);
    if (startPriceCents == null || minIncrementCents == null || minIncrementCents < 1) {
      setError("Enter valid start price and increment.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const auction = await gatewayFetch<Auction>("/api/auctions", token, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          category,
          condition,
          location,
          imageUrl,
          startPriceCents,
          minIncrementCents,
          endsAt: new Date(Date.now() + Number(hours) * 60 * 60 * 1000).toISOString(),
        }),
      });
      router.push(`/auctions/${auction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list the lot");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="relative overflow-hidden rounded-2xl border bg-[radial-gradient(80%_120%_at_100%_0%,oklch(0.55_0.12_55_/_0.18),transparent_50%),linear-gradient(180deg,var(--card),var(--background))] p-6 sm:p-8">
        <div className="relative flex flex-col gap-1.5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">Sell desk</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">List a lot</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Describe the item, set the opening price in ₹, and pick how long the floor stays open. Cancel is only allowed before the first accepted bid.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Listing details</CardTitle>
            <CardDescription>Everything below appears on the marketplace card and lot page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Listing failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <FieldGroup>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <p className="text-sm font-bold">Item</p>
                </div>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="e.g. Vintage film camera"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Condition notes, what's included, flaws…"
                    rows={4}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <select
                      id="category"
                      className={selectClassName}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="condition">Condition</FieldLabel>
                    <select
                      id="condition"
                      className={selectClassName}
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      {CONDITIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={80}
                      placeholder="City, Country"
                      className="pl-9"
                    />
                  </div>
                </Field>
              </FieldGroup>
              <Separator />
              <FieldGroup>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <p className="text-sm font-bold">Photo</p>
                </div>
                <Field>
                  <FieldLabel htmlFor="image">Image URL</FieldLabel>
                  <Input
                    id="image"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageBroken(false);
                    }}
                    placeholder="https://"
                    maxLength={500}
                  />
                  <FieldDescription>Public image shown on the marketplace card and lot page.</FieldDescription>
                </Field>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
                  {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Listing preview"
                      className="h-full w-full object-cover"
                      onError={() => setImageBroken(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                      <p className="text-xs">
                        {imageBroken ? "Could not load that image URL" : "Paste an image URL to preview it here"}
                      </p>
                    </div>
                  )}
                </div>
              </FieldGroup>
              <Separator />
              <FieldGroup>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <p className="text-sm font-bold">Pricing & timing</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="start">Start price</FieldLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="start"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        inputMode="decimal"
                        className="pl-7 tabular"
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="increment">Minimum increment</FieldLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="increment"
                        value={increment}
                        onChange={(e) => setIncrement(e.target.value)}
                        inputMode="decimal"
                        className="pl-7 tabular"
                      />
                    </div>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Duration</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {DURATIONS.map((item) => {
                      const selected = String(item.hours) === hours;
                      return (
                        <Button
                          key={item.hours}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() => setHours(String(item.hours))}
                        >
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={saving} size="lg" className="h-11 w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Listing…" : "List lot"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4">
          <Card className="overflow-hidden py-0 shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-muted">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <p className="text-xs">Marketplace card</p>
                </div>
              )}
              <Badge className="absolute top-3 right-3">OPEN</Badge>
            </div>
            <CardHeader className="pt-4">
              <CardTitle className="line-clamp-2 text-base">{previewTitle}</CardTitle>
              <CardDescription className="line-clamp-2">
                {category}
                {condition ? ` · ${condition}` : ""}
                {description ? ` · ${description}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Start</p>
                  <p className="tabular font-bold text-primary">
                    {startCents == null ? "—" : centsToDisplay(startCents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Increment</p>
                  <p className="tabular text-sm font-bold">
                    {incrementCents == null ? "—" : centsToDisplay(incrementCents)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Open for {durationLabel}
                {location ? ` · ${location}` : ""}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Before you list</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs leading-5 text-muted-foreground">
              <p>Clear titles and honest condition notes get more bids.</p>
              <Separator />
              <p>First accepted bid locks the lot — cancellation ends there.</p>
              <Separator />
              <p>Outbid holds release instantly back to available balance.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
