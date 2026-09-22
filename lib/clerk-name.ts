export type ClerkNameFields = {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: { emailAddress: string }[];
};

export function nameFromClerk(user: ClerkNameFields): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;
  const local = email?.split("@")[0]?.trim();
  return (user.username || user.fullName || full || local || "Bidder").trim();
}
