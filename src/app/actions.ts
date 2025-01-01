"use server";
import crypto from "crypto";

export const getPath = async (score: number, sum: number) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${score}+${sum}`)
    .digest("hex");
  return hash.slice(8, 28);
};
