import { NextResponse } from "next/server";

export class ServiceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function readRequest(
  request: Request,
): Promise<Record<string, unknown>> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
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
const calls = new Map<string, { since: number; count: number }>();
export function limitCalls(bucket: string) {
  const now = Date.now();
  let item = calls.get(bucket);
  if (!item || now - item.since > 60000) {
    item = { since: now, count: 0 };
    calls.set(bucket, item);
  }
  if (++item.count > 8)
    throw new ServiceError(
      "Too many requests. Wait one minute before trying again.",
      429,
    );
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
