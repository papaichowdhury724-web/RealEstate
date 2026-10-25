import { sql } from "drizzle-orm";
import { isFirebaseEnabled } from "@/lib/firebase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Firebase mode: nothing local to ping. Postgres mode: import lazily so a missing
    // DATABASE_URL can never break `next build`.
    if (!isFirebaseEnabled()) {
      const { db } = await import("@/db");
      await db.execute(sql`select 1`);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
