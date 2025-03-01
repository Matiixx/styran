import { expect, test } from "vitest";

import { generateTempPassword, generateTicker } from "./utils";

test("generateTempPassword", () => {
  const tempPassword = generateTempPassword();
  expect(tempPassword).toBeDefined();
  expect(tempPassword).toMatch(new RegExp("^temp_\\w{5}$"));
});

test("generateTicker", () => {
  expect(generateTicker("A")).toBe("A");
  expect(generateTicker("AB")).toBe("AB");
  expect(generateTicker("ABC")).toBe("ABC");
  expect(generateTicker("ABCD")).toBe("ACD");
  expect(generateTicker("ABCDE")).toBe("ACE");
  expect(generateTicker("Project Name")).toBe("PTE");
  expect(generateTicker("Project Name 3")).toBe("PT3");
});
