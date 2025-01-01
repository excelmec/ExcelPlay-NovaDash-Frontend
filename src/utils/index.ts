export function processNumber(num: number) {
  if (num < 10) {
    return num;
  }

  const sum = num
    .toString()
    .split("")
    .map(Number)
    .reduce((acc, digit) => acc + digit, 0);

  return sum;
}
