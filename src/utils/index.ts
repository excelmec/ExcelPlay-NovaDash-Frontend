import crypto from "crypto";

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

export const getPath = (score: number, sum: number) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${score}+${sum}`)
    .digest("hex");
  return hash.slice(8, 28);
};
