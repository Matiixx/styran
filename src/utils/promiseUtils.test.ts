import { describe, expect, it } from "vitest";

import { executePromisesBatch } from "./promiseUtils";

describe("executePromisesBatch", () => {
  it("should execute promises in batches", async () => {
    const promises = [
      () => Promise.resolve("result1"),
      () => Promise.resolve("result2"),
    ];
    const result = await executePromisesBatch(promises, 1);
    expect(result).toEqual(["result1", "result2"]);
  });

  it("different delay promises", async () => {
    let counter = 0;
    const promises = [
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            console.log("Resolving result1 after 500ms");
            counter++;
            expect(counter).toBe(1);
            resolve("result1");
          }, 500),
        ),
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            console.log("Resolving result2 after 200ms");
            counter++;
            expect(counter).toBe(2);
            resolve("result2");
          }, 200),
        ),
    ];
    const result = await executePromisesBatch(promises, 1);
    expect(result).toEqual(["result1", "result2"]);
  });

  it("test greater batch size", async () => {
    const batchSize = 10;
    let counter = 0;
    const promises = new Array(100).fill(0).map(
      (_, i) => () =>
        new Promise((resolve) => {
          setTimeout(() => {
            if (i !== 0 && i % batchSize === 0) {
              counter++;
            }
            expect(counter).toBe(Math.floor(i / batchSize));
            resolve(i);
          }, 100);
        }),
    );
    const result = await executePromisesBatch(promises, 10);
    expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });
});
