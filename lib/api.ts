import { auth } from "@clerk/nextjs/server";

import { gatewayFetch } from "@/lib/gateway";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  return gatewayFetch<T>(path, token, init);
}
