import { ServiceError } from "./http";
/** Used when ANTHROPIC_MODEL is not set, so hosting only needs the API key. */
export const DEFAULT_MODEL = "claude-sonnet-5-5";
function configuredModel() {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}
export function aiStatus() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  const model = configuredModel();
  return {
    provider: "Claude",
    configured:
      !!key && !!model && /^claude-[a-zA-Z0-9._-]{1,120}$/.test(model),
  };
}
/** All AI calls use Anthropic Messages. No fallback, secret logging or client credential. */
export async function generateJSON(
  system: string,
  input: unknown,
  fetcher: typeof fetch = fetch,
) {
  const status = aiStatus();
  if (!status.configured)
    throw new ServiceError(
      "Claude is not configured yet. Set ANTHROPIC_API_KEY (and optionally ANTHROPIC_MODEL), then restart. The manual version remains available.",
      503,
    );
  const model = configuredModel();
  const response = await fetcher("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!.trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: `${system}\nReturn only the requested JSON object, without Markdown.`,
      messages: [{ role: "user", content: JSON.stringify(input) }],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok)
    throw new ServiceError(
      "Claude could not complete the request. Check its key, model and API credits. The manual version remains available.",
      502,
    );
  const data = await response.json();
  const text = Array.isArray(data?.content)
    ? data.content
        .filter((p: { type?: string }) => p.type === "text")
        .map((p: { text?: string }) => p.text ?? "")
        .join("")
    : "";
  if (data?.stop_reason !== "end_turn" || !text.trim() || text.length > 20000)
    throw new ServiceError(
      "The AI response is incomplete or invalid. Keep the manual version.",
      502,
    );
  try {
    return {
      value: JSON.parse(
        text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1"),
      ) as unknown,
      provider: status.provider,
      model,
    };
  } catch {
    throw new ServiceError(
      "The AI response was not valid JSON. Keep the manual version.",
      502,
    );
  }
}
