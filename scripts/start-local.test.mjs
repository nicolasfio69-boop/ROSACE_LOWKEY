import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  dependencyKey,
  needsInstall,
  isRosace,
  waitForSite,
} from "./start-local.mjs";
const page = "<title>Rosace: prepare the right conversations</title>";
test("the lockfile and runtime determine when to reinstall", () => {
  assert.equal(
    dependencyKey("lock", "24:win32:x64"),
    dependencyKey("lock", "24:win32:x64"),
  );
  assert.notEqual(
    dependencyKey("lock", "24:win32:x64"),
    dependencyKey("new lock", "24:win32:x64"),
  );
  assert.notEqual(
    dependencyKey("lock", "24:win32:x64"),
    dependencyKey("lock", "22:win32:x64"),
  );
  const dir = mkdtempSync(join(tmpdir(), "rosace-launcher-"));
  try {
    assert.equal(needsInstall(dir, "key"), true);
    mkdirSync(join(dir, "node_modules/next/dist/bin"), { recursive: true });
    writeFileSync(join(dir, "node_modules/next/dist/bin/next"), "fixture");
    writeFileSync(join(dir, "node_modules/.rosace-install"), "key");
    assert.equal(needsInstall(dir, "key"), false);
    assert.equal(needsInstall(dir, "changed-key"), true);
    rmSync(join(dir, "node_modules/next/dist/bin/next"));
    assert.equal(needsInstall(dir, "key"), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("a different service or a failed response is not treated as Rosace", async () => {
  assert.equal(
    await isRosace("http://local", async () => new Response("Another site")),
    false,
  );
  assert.equal(
    await isRosace(
      "http://local",
      async () => new Response(page, { status: 500 }),
    ),
    false,
  );
  assert.equal(
    await isRosace("http://local", async () => new Response(page)),
    true,
  );
});
test("the browser is only ready after the app responds", async () => {
  let calls = 0;
  await waitForSite("http://local", () => true, {
    fetcher: async () => new Response(++calls < 2 ? "Starting" : page),
    pause: async () => {},
    attempts: 3,
  });
  assert.equal(calls, 2);
});
test("startup failure and readiness timeout produce actionable errors", async () => {
  await assert.rejects(
    waitForSite("http://local", () => false),
    /server stopped/,
  );
  await assert.rejects(
    waitForSite("http://local", () => true, {
      fetcher: async () => new Response("Starting"),
      pause: async () => {},
      attempts: 2,
    }),
    /did not become ready/,
  );
});
