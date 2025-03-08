import floor from "lodash/floor";

const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  return -1 * floor(offset / 60);
};

export { getTimezoneOffset };
