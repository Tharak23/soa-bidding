"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gatewayFetch } from "@/lib/gateway";
import { dollarsToCents } from "@/lib/money";
import type { Auction } from "@/lib/types";

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
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function SellPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("Used - Good");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startPrice, setStartPrice] = useState("10.00");
  const [increment, setIncrement] = useState("1.00");
  const [hours, setHours] = useState("24");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Sell a lot</CardTitle>
          <CardDescription>Cancel is only allowed before the first accepted bid.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Listing failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <select id="category" className={selectClassName} value={category} onChange={(e) => setCategory(e.target.value)}>
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
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} />
              </Field>
              <Field>
                <FieldLabel htmlFor="image">Image URL</FieldLabel>
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://"
                  maxLength={500}
                />
                <FieldDescription>Public image shown on the marketplace card and lot page.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="start">Start price</FieldLabel>
                <Input id="start" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} inputMode="decimal" />
              </Field>
              <Field>
                <FieldLabel htmlFor="increment">Minimum increment</FieldLabel>
                <Input id="increment" value={increment} onChange={(e) => setIncrement(e.target.value)} inputMode="decimal" />
              </Field>
              <Field>
                <FieldLabel htmlFor="duration">Duration</FieldLabel>
                <select id="duration" className={selectClassName} value={hours} onChange={(e) => setHours(e.target.value)}>
                  {DURATIONS.map((item) => (
                    <option key={item.hours} value={String(item.hours)}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={saving}>
              List lot
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
