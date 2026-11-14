import { ServiceError } from "./http";
/** Provider selection is explicit when configured; never retry against a second paid service. */
export function aiStatus() {
  const selected = (
    process.env.AI_PROVIDER ||
    (process.env.FEATHERLESS_API_KEY
      ? "featherless"
      : process.env.GEMINI_API_KEY
        ? "gemini"
        : "featherless")
  )
    .trim()
    .toLowerCase();
  const featherless = selected === "featherless",
    supported = featherless || selected === "gemini";
  const key = (
    featherless ? process.env.FEATHERLESS_API_KEY : process.env.GEMINI_API_KEY
  )?.trim();
  const model = (
    featherless ? process.env.FEATHERLESS_MODEL : process.env.GEMINI_MODEL
  )?.trim();
  const validModel =
    !!model &&
    model.length <= 200 &&
    (featherless ? /^[a-zA-Z0-9._:/-]+$/ : /^[a-zA-Z0-9._-]+$/).test(model);
  return {
    provider: featherless
      ? "Featherless"
      : selected === "gemini"
        ? "Gemini"
        : "Unsupported provider",
    configured: supported && !!key && validModel,
  };
}
export async function generateJSON(
  system: string,
  input: unknown,
  fetcher: typeof fetch = fetch,
) {
  const status = aiStatus();
  if (!status.configured)
    throw new ServiceError(
      `${status.provider} is not configured yet. Add its API key and model in .env.local, then restart. The manual version remains available.`,
      503,
    );
  const featherless = status.provider === "Featherless";
  const key = (
    featherless ? process.env.FEATHERLESS_API_KEY : process.env.GEMINI_API_KEY
  )!.trim();
  const model = (
    featherless ? process.env.FEATHERLESS_MODEL : process.env.GEMINI_MODEL
  )!.trim();
  const endpoint = featherless
    ? "https://api.featherless.ai/v1/chat/completions"
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(featherless
      ? { Authorization: `Bearer ${key}` }
      : { "x-goog-api-key": key }),
  };
  const body = featherless
    ? {
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(input) },
        ],
        temperature: 0.2,
        max_tokens: 1800,
        stream: false,
      }
    : {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 1800,
        },
      };
  const response = await fetcher(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new ServiceError(
      `${status.provider} could not complete the request. Check its key, model and credits. The manual version remains available.`,
      502,
    );
  const data = await response.json();
  const candidate = featherless ? data?.choices?.[0] : data?.candidates?.[0];
  const finish = featherless
    ? candidate?.finish_reason
    : candidate?.finishReason;
  let text = featherless
    ? candidate?.message?.content
    : candidate?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("");
  if (
    finish !== (featherless ? "stop" : "STOP") ||
    typeof text !== "string" ||
    !text.trim() ||
    text.length > 10000
  )
    throw new ServiceError(
      "The AI response is incomplete or invalid. Keep the manual version.",
      502,
    );
  text = text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1");
  try {
    return {
      value: JSON.parse(text) as unknown,
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
