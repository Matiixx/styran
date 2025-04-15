import { describe, it, expect } from "vitest";

import { discordRegex } from "./projectSchemas";

describe("discordRegex", () => {
  it("should accept valid discord webhook urls", () => {
    expect(
      discordRegex.test(
        "https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz",
      ),
    ).toBe(true);
    expect(
      discordRegex.test(
        "https://discord.com/api/webhooks/1360575735592521827/4M8q3yWOPQGeKkTYm90eEA_tN3ITWPWl4Fkf1R1G-KRuY7JrU_FrWPV0dK8KdG2W_ggH",
      ),
    ).toBe(true);
  });

  it("should reject invalid discord webhook urls", () => {
    expect(discordRegex.test("https://www.google.com")).toBe(false);
    expect(
      discordRegex.test(
        "https://discord.com/api/1234567890/abcdefghijklmnopqrstuvwxyz",
      ),
    ).toBe(false);
    expect(
      discordRegex.test(
        "https://discord.com/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz",
      ),
    ).toBe(false);
  });
});
