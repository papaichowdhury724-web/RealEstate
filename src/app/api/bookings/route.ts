import { NextResponse } from "next/server";
import { addBooking, deleteBooking, getConfig, listBookings, updateBooking } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cfg = await getConfig();
  if (!cfg.features.booking) return NextResponse.json({ error: "Booking is currently disabled" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const f of cfg.bookingFields.filter((x) => x.enabled)) {
    const v = String(body[f.key] ?? "").trim().slice(0, 2000);
    if (f.required && !v) return NextResponse.json({ error: `${f.label} is required` }, { status: 400 });
    if (v) data[(f.label || f.key).replace(/^__.*__$/, "_$&")] = v; // Firestore forbids empty / __x__ field names
  }
  try {
    const id = await addBooking(data);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("addBooking failed", e);
    return NextResponse.json({ error: "Could not save your booking right now. Please try again or call us." }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listBookings());
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = (await req.json()) as { id: string; status: string };
  if (!id || !["pending", "confirmed", "cancelled"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await updateBooking(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (id) await deleteBooking(id);
  return NextResponse.json({ ok: true });
}
