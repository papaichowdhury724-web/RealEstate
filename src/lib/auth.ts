import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

// Admin password comes from the ADMIN_PASSWORD env var.
// In development only, it falls back to "admin123". In production there is NO default:
// if ADMIN_PASSWORD is missing, admin login is disabled instead of using a guessable password.
export const ADMIN_COOKIE = "estate_admin";
const password = () => process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin123" : "");
export const tokenFor = (pw: string) => createHash("sha256").update(`estate::${pw}::v1`).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function isAdmin() {
  const pw = password();
  if (!pw) return false;
  const c = await cookies();
  const v = c.get(ADMIN_COOKIE)?.value;
  return !!v && safeEqual(v, tokenFor(pw));
}
export const checkPassword = (pw: string) => {
  const real = password();
  return !!real && safeEqual(createHash("sha256").update(pw).digest("hex"), createHash("sha256").update(real).digest("hex"));
};
