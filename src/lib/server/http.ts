import { NextResponse } from "next/server";

export class ServiceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
/**
 * Behind a hosting proxy (Aiven), request.url carries the internal address,
 * so the browser's Origin is compared with the public host the proxy forwards.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = [
    new URL(request.url).host,
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
    request.headers.get("host"),
  ];
  return allowed.some((candidate) => candidate && candidate === host);
}
export async function readRequest(
  request: Request,
): Promise<Record<string, unknown>> {
  if (!sameOrigin(request))
    throw new ServiceError("Cross-origin requests are not allowed.", 403);
  const reader = request.body?.getReader();
  if (!reader) throw new ServiceError("Missing request.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 64000) {
      await reader.cancel();
      throw new ServiceError("Request too large.", 413);
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(merged));
  } catch {
    throw new ServiceError("Invalid JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new ServiceError("Invalid request.");
  return data as Record<string, unknown>;
}
export function field(
  data: Record<string, unknown>,
  name: string,
  max: number,
  optional = false,
): string {
  const value = data[name];
  if (optional && value === undefined) return "";
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!optional && !value.trim())
  )
    throw new ServiceError(`Invalid ${name}.`);
  return value.trim();
}
const WINDOW_MS = 60000;
const DAY_MS = 24 * 60 * 60000;
/** Per visitor and per minute; the whole site per minute and per day protects the API credits. */
export const LIMITS = { visitorPerMinute: 6, sitePerMinute: 40, sitePerDay: 600 };
const calls = new Map<string, { since: number; count: number }>();
function visitor(request?: Request): string {
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || request?.headers.get("x-real-ip") || "local").slice(0, 64);
}
function count(key: string, windowMs: number, max: number, message: string) {
  const now = Date.now();
  let item = calls.get(key);
  if (!item || now - item.since > windowMs) {
    item = { since: now, count: 0 };
    calls.set(key, item);
  }
  if (item.count >= max) throw new ServiceError(message, 429);
  item.count++;
}
export function limitCalls(bucket: string, request?: Request) {
  if (calls.size > 5000) calls.clear();
  count(
    `${bucket}:visitor:${visitor(request)}`,
    WINDOW_MS,
    LIMITS.visitorPerMinute,
    "Too many requests. Wait one minute before trying again.",
  );
  count(
    `${bucket}:site`,
    WINDOW_MS,
    LIMITS.sitePerMinute,
    "The demo is busy. Wait one minute before trying again.",
  );
  count(
    `${bucket}:day`,
    DAY_MS,
    LIMITS.sitePerDay,
    "Today's demo allowance is used up. The manual version remains available.",
  );
}
export function resetCallLimits() {
  calls.clear();
}
export function failure(error: unknown) {
  const known = error instanceof ServiceError;
  return NextResponse.json(
    {
      error: known
        ? error.message
        : "The provider could not complete this request. Continue with the manual version or try again later.",
    },
    {
      status: known ? error.status : 502,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
export function noStore(data: unknown) {
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
