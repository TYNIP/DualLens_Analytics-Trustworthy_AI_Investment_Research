import { describe, expect, it } from "vitest";

import { appModeSchema, DEFAULT_APP_MODE } from "./app";

describe("application mode", () => {
  it("defaults to demo mode", () => {
    expect(DEFAULT_APP_MODE).toBe("demo");
  });

  it("accepts the two planned modes", () => {
    expect(appModeSchema.parse("demo")).toBe("demo");
    expect(appModeSchema.parse("local-ai")).toBe("local-ai");
  });

  it("rejects account or cloud modes", () => {
    expect(appModeSchema.safeParse("cloud").success).toBe(false);
    expect(appModeSchema.safeParse("authenticated").success).toBe(false);
  });
});
