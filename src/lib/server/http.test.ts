import { afterEach, describe, expect, it } from "vitest";
import { LIMITS, limitCalls, resetCallLimits, sameOrigin } from "./http";

const from = (ip: string) =>
  new Request("https://rosace.test/api/x", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });

afterEach(() => resetCallLimits());

describe("AI call limits", () => {
  it("limits each visitor separately, so one visitor cannot block another", () => {
    for (let i = 0; i < LIMITS.visitorPerMinute; i++)
      limitCalls("ai", from("1.1.1.1"));
    expect(() => limitCalls("ai", from("1.1.1.1"))).toThrow(
      "Too many requests",
    );
    expect(() => limitCalls("ai", from("2.2.2.2"))).not.toThrow();
  });

  it("caps the whole site per minute to protect the API credits", () => {
    for (let i = 0; i < LIMITS.sitePerMinute; i++)
      limitCalls("ai", from(`3.3.${i}.1`));
    expect(() => limitCalls("ai", from("4.4.4.4"))).toThrow("busy");
  });
});

describe("same-origin check behind the hosting proxy", () => {
  const internal = (headers: Record<string, string>) =>
    new Request("http://0.0.0.0:8080/api/need-proposal", {
      method: "POST",
      headers,
    });

  it("accepts the public site when the proxy forwards its host", () => {
    expect(
      sameOrigin(
        internal({ origin: "https://rosace.example", host: "rosace.example" }),
      ),
    ).toBe(true);
    expect(
      sameOrigin(
        internal({
          origin: "https://rosace.example",
          "x-forwarded-host": "rosace.example",
        }),
      ),
    ).toBe(true);
  });

  it("refuses another site, a malformed origin, and accepts calls without an origin", () => {
    expect(
      sameOrigin(
        internal({ origin: "https://evil.example", host: "rosace.example" }),
      ),
    ).toBe(false);
    expect(
      sameOrigin(internal({ origin: "null", host: "rosace.example" })),
    ).toBe(false);
    expect(sameOrigin(internal({ host: "rosace.example" }))).toBe(true);
  });
});
