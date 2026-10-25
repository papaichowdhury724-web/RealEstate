import { NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getConfig(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = (await req.json()) as SiteConfig;
  if (!cfg?.site || !Array.isArray(cfg.sections)) return NextResponse.json({ error: "Invalid config" }, { status: 400 });
  try {
    await saveConfig(cfg);
  } catch (e) {
    console.error("saveConfig failed", e);
    return NextResponse.json({ error: "Could not write to the database (check Firestore is created and rules are published)" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
