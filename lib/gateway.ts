import type { ApiError } from "@/lib/types";

export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class GatewayError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function gatewayFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (res.status === 204) {
    return null as T;
  }

  const body = (await res.json().catch(() => ({}))) as ApiError & T;

  if (!res.ok) {
    throw new GatewayError(
      res.status,
      body.message ?? `Request failed (${res.status})`,
      body.code,
    );
  }

  return body as T;
}
