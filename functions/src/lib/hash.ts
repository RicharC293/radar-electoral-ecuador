import { createHash } from "node:crypto";

function secret() {
  const value = process.env.APP_SECRET;
  if (!value) {
    throw new Error("APP_SECRET is not configured.");
  }

  return value;
}

export function secureHash(input: string) {
  return createHash("sha256").update(`${secret()}:${input}`).digest("hex");
}
