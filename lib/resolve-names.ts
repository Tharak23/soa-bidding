import { clerkClient } from "@clerk/nextjs/server";

import { nameFromClerk } from "@/lib/clerk-name";

export async function resolveDisplayNames(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
  if (unique.length === 0) {
    return {};
  }

  const clerk = await clerkClient();
  const names: Record<string, string> = {};

  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    try {
      const result = await clerk.users.getUserList({
        userId: chunk,
        limit: chunk.length,
      });
      const users = Array.isArray(result) ? result : result.data;
      for (const user of users) {
        names[user.id] = nameFromClerk(user);
      }
    } catch {
      await Promise.all(
        chunk.map(async (id) => {
          if (names[id]) {
            return;
          }
          try {
            const user = await clerk.users.getUser(id);
            names[user.id] = nameFromClerk(user);
          } catch {
            names[id] = "Bidder";
          }
        }),
      );
    }
  }

  for (const id of unique) {
    if (!names[id]) {
      names[id] = "Bidder";
    }
  }

  return names;
}
