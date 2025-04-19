import floor from "lodash/floor";
import dayjs, { type Dayjs } from "./dayjs";

const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  return -1 * floor(offset / 60);
};

const getCurrentDayInTimezone = (timezone: number) => {
  const today = dayjs().utc();
  const todayInTimezone = today.add(timezone, "hours");
  return todayInTimezone;
};

const getUTCDate = (date: Dayjs, timezone: number) => {
  return date.subtract(timezone, "hours");
};

const isTimeWithinHourWindow = (
  timezone: number,
  targetHour = 8,
  bufferMinutes = 15,
): boolean => {
  const localTime = getCurrentDayInTimezone(timezone);
  const localHour = localTime.hour();
  const localMinute = localTime.minute();

  if (localHour === targetHour && localMinute < bufferMinutes) {
    return true; // e.g., 8:00-8:15
  } else if (
    localHour === targetHour - 1 &&
    localMinute >= 60 - bufferMinutes
  ) {
    return true; // e.g., 7:45-8:00
  } else if (
    targetHour === 0 &&
    localHour === 23 &&
    localMinute >= 60 - bufferMinutes
  ) {
    return true;
  }
  return false;
};

const getTimezonesInTargetHourWindow = (
  targetHour = 8,
  bufferMinutes = 15,
  targetDayOfWeek?: number,
): number[] => {
  const now = dayjs().utc();
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentDayOfWeek = now.day();

  const matchingTimezones: number[] = [];

  for (let offset = -12; offset <= 14; offset++) {
    let hourInTimezone = (currentHour + offset) % 24;
    if (hourInTimezone < 0) hourInTimezone += 24;

    let dayOfWeekInTimezone = currentDayOfWeek;
    if (currentHour + offset >= 24) {
      dayOfWeekInTimezone = (currentDayOfWeek + 1) % 7;
    } else if (currentHour + offset < 0) {
      dayOfWeekInTimezone = currentDayOfWeek - 1;
      if (dayOfWeekInTimezone < 0) dayOfWeekInTimezone = 6;
    }

    if (
      targetDayOfWeek !== undefined &&
      dayOfWeekInTimezone !== targetDayOfWeek
    ) {
      continue;
    }

    if (hourInTimezone === targetHour && currentMinute < bufferMinutes) {
      matchingTimezones.push(offset);
    } else if (
      hourInTimezone === targetHour - 1 &&
      currentMinute >= 60 - bufferMinutes
    ) {
      matchingTimezones.push(offset);
    } else if (
      targetHour === 0 &&
      hourInTimezone === 23 &&
      currentMinute >= 60 - bufferMinutes
    ) {
      matchingTimezones.push(offset);
    }
  }

  return matchingTimezones;
};

const DayOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const TimeConstants = {
  MILLISECONDS_IN_HOUR: 1000 * 60 * 60,
  MILLISECONDS_IN_MINUTE: 1000 * 60,
  MILLISECONDS_IN_SECOND: 1000,
};

export {
  getTimezoneOffset,
  getCurrentDayInTimezone,
  getUTCDate,
  isTimeWithinHourWindow,
  getTimezonesInTargetHourWindow,
  DayOfWeek,
  TimeConstants,
};
