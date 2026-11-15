import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function dependencyKey(
  lock,
  runtime = `${process.versions.node.split(".")[0]}:${process.platform}:${process.arch}`,
) {
  return createHash("sha256").update(lock).update(runtime).digest("hex");
}
export function needsInstall(directory, key) {
  const marker = join(directory, "node_modules", ".rosace-install");
  try {
    return (
      !existsSync(
        join(directory, "node_modules", "next", "dist", "bin", "next"),
      ) || readFileSync(marker, "utf8").trim() !== key
    );
  } catch {
    return true;
  }
}
export async function isRosace(url, fetcher = fetch) {
  try {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(1500),
      redirect: "error",
    });
    return (
      response.ok &&
      (await response.text()).includes(
        "<title>Rosace: prepare the right conversations</title>",
      )
    );
  } catch {
    return false;
  }
}
export async function waitForSite(
  url,
  alive,
  { fetcher = fetch, pause = delay, attempts = 120 } = {},
) {
  for (let i = 0; i < attempts; i++) {
    if (!alive())
      throw new Error(
        "The server stopped before it was ready. Read the error above.",
      );
    if (await isRosace(url, fetcher)) return;
    await pause(1000);
  }
  throw new Error(
    "The site did not become ready. Read the server output and try again.",
  );
}
function portAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => server.close(() => resolve()));
  });
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Dependency installation failed (exit ${code}).`)),
    );
  });
}
function openBrowser(url) {
  const command =
    process.platform === "win32"
      ? "cmd.exe"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `start "" "${url}"`]
      : [url];
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.on("error", () =>
    console.log(`Open this address in your browser: ${url}`),
  );
  child.unref();
}
async function main() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 13))
    throw new Error(
      "Install Node.js 24 LTS from https://nodejs.org and start again.",
    );
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--no-open"))
    throw new Error("The only supported option is --no-open.");
  const url = "http://localhost:3001";
  const probe = "http://127.0.0.1:3001";
  if (await isRosace(probe)) {
    console.log(`Rosace is already running: ${url}`);
    if (!args.includes("--no-open")) openBrowser(url);
    return;
  }
  try {
    await portAvailable(3001);
  } catch {
    throw new Error(
      "Port 3001 is occupied by another service. Close that service, then double-click start-local.cmd again.",
    );
  }
  const key = dependencyKey(readFileSync(join(root, "package-lock.json")));
  if (needsInstall(root, key)) {
    console.log(
      "First launch or updated dependencies: installing once. This needs an internet connection...",
    );
    if (process.platform === "win32")
      await run("cmd.exe", ["/d", "/s", "/c", "npm.cmd ci"]);
    else await run("npm", ["ci"]);
    writeFileSync(join(root, "node_modules", ".rosace-install"), key);
  } else console.log("Dependencies are ready. No reinstall needed.");
  console.log(
    "Starting Rosace. Keep this window open; Ctrl+C stops the server.",
  );
  const server = spawn(
    process.execPath,
    [
      join(root, "node_modules", "next", "dist", "bin", "next"),
      "dev",
      "--turbopack",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3001",
    ],
    { cwd: root, stdio: "inherit" },
  );
  let alive = true;
  let stopping = false;
  server.once("error", (error) => {
    alive = false;
    console.error(error.message);
  });
  server.once("exit", (code) => {
    alive = false;
    process.exitCode = stopping ? 0 : (code ?? 1);
  });
  process.once("SIGINT", () => {
    stopping = true;
    server.kill("SIGINT");
  });
  process.once("SIGTERM", () => {
    stopping = true;
    server.kill("SIGTERM");
  });
  try {
    await waitForSite(probe, () => alive);
  } catch (error) {
    server.kill();
    throw error;
  }
  console.log(
    `\nReady: ${url}\nNext time, simply double-click start-local.cmd. Cursor is optional.`,
  );
  if (!args.includes("--no-open")) openBrowser(url);
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(`\n${error.message}`);
    process.exitCode = 1;
  });
}
