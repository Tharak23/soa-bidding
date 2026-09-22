"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Gavel } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { gatewayFetch } from "@/lib/gateway";
import type { Profile } from "@/lib/types";

export default function OnboardPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const profile = await gatewayFetch<Profile>("/api/me", token);
        if (cancelled) return;
        if (profile.onboarded) {
          router.replace("/marketplace");
          return;
        }
        setDisplayName(profile.displayName ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      await gatewayFetch<Profile>("/api/me", token, {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim(),
          onboarded: true,
        }),
      });
      router.replace("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4 text-primary" />
            <CardTitle>Set your floor name</CardTitle>
          </div>
          <CardDescription>
            One short display name. You can change it later in Profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Could not continue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={80}
                  required
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={saving || displayName.trim().length === 0}>
              Enter BidVelocity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
