import { it, describe, expect } from "vitest";

import { decryptText, encryptObject } from "./index";

describe("encryptObject", () => {
  it("should encrypt an object", () => {
    const encrypted = encryptObject({ name: "John", age: 30 }, "secret");
    expect(encrypted).toBeDefined();
  });

  it("should decrypt an object", () => {
    const encrypted = encryptObject({ name: "John", age: 30 }, "secret");
    const decrypted = decryptText(encrypted, "secret");
    expect(decrypted).toEqual({ name: "John", age: 30 });
  });

  it("should encrypt empty object", () => {
    const encrypted = encryptObject({}, "secret");
    expect(encrypted).toBeDefined();
  });

  it("should decrypt empty object", () => {
    const encrypted = encryptObject({}, "secret");
    const decrypted = decryptText(encrypted, "secret");
    expect(decrypted).toEqual({});
  });
});
