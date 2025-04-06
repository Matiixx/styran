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

const TimeConstants = {
  MILLISECONDS_IN_HOUR: 1000 * 60 * 60,
  MILLISECONDS_IN_MINUTE: 1000 * 60,
  MILLISECONDS_IN_SECOND: 1000,
};

export {
  getTimezoneOffset,
  getCurrentDayInTimezone,
  getUTCDate,
  TimeConstants,
};
