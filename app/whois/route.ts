import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { resolveDisplayNames } from "@/lib/resolve-names";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ names: {} }, { status: 401 });
  }

  let ids: string[] = [];
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      ids = body.ids.filter((id): id is string => typeof id === "string").slice(0, 50);
    }
  } catch {
    ids = [];
  }

  const names = await resolveDisplayNames(ids);
  return NextResponse.json({ names });
}
