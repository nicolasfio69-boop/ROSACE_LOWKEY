import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const key = process.env.ANTHROPIC_API_KEY?.trim();
const model = process.env.ANTHROPIC_MODEL?.trim();
if (!key || !model || !/^claude-[a-zA-Z0-9._-]{1,120}$/.test(model)) {
  console.error("Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL in .env.local first. No request was sent.");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},
      body: JSON.stringify({model,max_tokens:1024,messages:[{role:"user",content:'Connection test with fictional data only. Reply with exactly this JSON: {"ok":true}'}]}),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`Claude returned HTTP ${response.status}. Check API access, model and billing in the Anthropic console.`);
    const result = await response.json();
    const text = result.content?.filter(p => p.type === "text").map(p => p.text).join("").trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1");
    if (result.stop_reason !== "end_turn" || JSON.parse(text).ok !== true) throw new Error("Claude responded, but the JSON check did not pass. No project data was sent.");
    console.log(`Claude API OK (${model}). One bounded connection test completed; no project data sent.`);
  } catch (error) {
    console.error(error instanceof SyntaxError ? "Claude responded with unexpected JSON." : error instanceof Error && error.message.startsWith("Claude") ? error.message : "Could not connect to Claude. Check network access and the API configuration.");
    process.exitCode = 1;
  }
}
