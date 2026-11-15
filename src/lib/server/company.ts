import { isIP } from "node:net";
import { ServiceError } from "./http";
import type { Source } from "../context";

export function companyUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new ServiceError("Enter a complete HTTPS company website URL.");
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !host.includes(".") ||
    isIP(host.replace(/^\[|\]$/g, "")) ||
    /(^|\.)(localhost|local|internal|test|invalid)$/.test(host) ||
    !/^[a-z0-9.-]+$/.test(host)
  )
    throw new ServiceError(
      "Use a public HTTPS company website, without credentials or a custom port.",
    );
  if (/linkedin\.com$|facebook\.com$|instagram\.com$/.test(host))
    throw new ServiceError(
      "Use the company's own website, not personal or social profiles.",
    );
  url.hash = "";
  url.search = "";
  return url.toString();
}
export function parseCompanyResponse(value: unknown, url: string): Source {
  if (!value || typeof value !== "object")
    throw new ServiceError(
      "The collection service returned an unreadable response.",
      502,
    );
  const result = value as {
    markdown?: { success?: boolean; data?: unknown };
    metadata?: { title?: unknown };
  };
  if (
    result.markdown?.success !== true ||
    typeof result.markdown.data !== "string" ||
    !result.markdown.data.trim()
  )
    throw new ServiceError(
      "This page could not be read. Paste a company description instead.",
      502,
    );
  return {
    id: "company",
    title:
      typeof result.metadata?.title === "string"
        ? result.metadata.title.slice(0, 200)
        : new URL(url).hostname,
    text: result.markdown.data.slice(0, 16000),
    url,
    fetchedAt: new Date().toISOString(),
  };
}
const cache = new Map<string, { source: Source; at: number }>();
export async function collectCompany(
  input: string,
  fetcher: typeof fetch = fetch,
): Promise<{ source: Source; cached: boolean }> {
  const url = companyUrl(input);
  const key = process.env.CONTEXT_DEV_API_KEY;
  if (!key)
    throw new ServiceError(
      "Company collection is not configured. Add CONTEXT_DEV_API_KEY in .env.local and restart, or paste context manually.",
      503,
    );
  const previous = cache.get(url);
  if (previous && Date.now() - previous.at < 30 * 60000)
    return { source: previous.source, cached: true };
  const response = await fetcher("https://api.context.dev/v1/web/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: { markdown: true },
      sharedParams: { mainContentOnly: true },
      maxAgeMs: 0,
    }),
    signal: AbortSignal.timeout(25000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new ServiceError(
      response.status === 401
        ? "Context.dev rejected the configured key. Check it in .env.local."
        : response.status === 402
          ? "Context.dev credits are unavailable. Use manual company context."
          : "Company collection failed. Use manual context or retry later.",
      502,
    );
  const source = parseCompanyResponse(await response.json(), url);
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(url, { source, at: Date.now() });
  return { source, cached: false };
}
