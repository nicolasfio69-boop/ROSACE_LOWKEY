import { afterEach, describe, expect, it } from "vitest";
import { LIMITS, limitCalls, resetCallLimits } from "./http";

const from = (ip: string) =>
  new Request("https://rosace.test/api/x", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });

afterEach(() => resetCallLimits());

describe("AI call limits", () => {
  it("limits each visitor separately, so one visitor cannot block another", () => {
    for (let i = 0; i < LIMITS.visitorPerMinute; i++) limitCalls("ai", from("1.1.1.1"));
    expect(() => limitCalls("ai", from("1.1.1.1"))).toThrow("Too many requests");
    expect(() => limitCalls("ai", from("2.2.2.2"))).not.toThrow();
  });

  it("caps the whole site per minute to protect the API credits", () => {
    for (let i = 0; i < LIMITS.sitePerMinute; i++) limitCalls("ai", from(`3.3.${i}.1`));
    expect(() => limitCalls("ai", from("4.4.4.4"))).toThrow("busy");
  });
});
