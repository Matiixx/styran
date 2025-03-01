export const generateTempPassword = () => {
  return `temp_${Math.random().toString(36).substring(2, 7)}`;
};

export const generateTicker = (name: string) => {
  if (name.trim().length < 3) {
    return name.toUpperCase();
  }

  let firstIndex = 0;
  while (firstIndex < name.length && name[firstIndex]!.trim() === "") {
    firstIndex++;
  }
  const first = name[firstIndex];

  let middleIndex = Math.floor(name.length / 2);
  while (middleIndex > firstIndex && name[middleIndex]!.trim() === "") {
    middleIndex--;
  }
  const middle = name[middleIndex];

  let lastIndex = name.length - 1;
  while (lastIndex > middleIndex && name[lastIndex]!.trim() === "") {
    lastIndex--;
  }
  const last = name[lastIndex];

  if (!first || !middle || !last) {
    return name.slice(0, 3).toUpperCase();
  }

  return [first, middle, last].join("").toUpperCase();
};
