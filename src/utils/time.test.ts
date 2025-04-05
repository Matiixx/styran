import { describe, expect, it } from "vitest";

import { getCurrentDayInTimezone, getUTCDate } from "./timeUtils";
import dayjs from "./dayjs";

describe("getCurrentDayInTimezone", () => {
  it("should return the current day in the timezone", () => {
    const todayUtc = getCurrentDayInTimezone(0);
    expect(todayUtc.date()).toBe(dayjs().date());
  });

  it("should return the current day in the timezone", () => {
    const todayUtc = getCurrentDayInTimezone(1);
    expect(todayUtc.hour()).toBe(dayjs().utc().hour() + 1);

    expect(dayjs().utc().format("YYYY-MM-DD HH:mm:ss")).toBe(
      getUTCDate(todayUtc, 1).format("YYYY-MM-DD HH:mm:ss"),
    );
  });
});
