"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { gatewayFetch } from "@/lib/gateway";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const next = await gatewayFetch<Profile>("/api/me", token);
        if (cancelled) return;
        setProfile(next);
        setDisplayName(next.displayName ?? "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const token = await getToken();
      const next = await gatewayFetch<Profile>("/api/me", token, {
        method: "PATCH",
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      setProfile(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatarUrl ?? user?.imageUrl} alt="" />
              <AvatarFallback>{(displayName || "B").slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Save failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {saved ? (
              <Alert>
                <AlertTitle>Saved</AlertTitle>
                <AlertDescription>Your floor name is updated.</AlertDescription>
              </Alert>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Display name</FieldLabel>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={saving}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
