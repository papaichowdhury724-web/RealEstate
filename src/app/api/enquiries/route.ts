import { NextResponse } from "next/server";
import { addEnquiry, deleteEnquiry, getConfig, listEnquiries, updateEnquiry } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cfg = await getConfig();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const isNewsletter = b.kind === "newsletter";
  if (!isNewsletter && !(cfg.features.enquiry || cfg.features.shortlist))
    return NextResponse.json({ error: "Enquiries are disabled" }, { status: 403 });
  const s = (k: string) => String(b[k] ?? "").trim().slice(0, 2000);
  if (!isNewsletter && (!s("name") || !s("phone"))) return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  if (isNewsletter && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s("email"))) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  let id: string;
  try {
    id = await addEnquiry({
    name: isNewsletter ? "Newsletter subscriber" : s("name"),
    phone: s("phone"), email: s("email"), message: isNewsletter ? "Newsletter signup" : s("message"),
    coupon: s("coupon"), propertyIds: Array.isArray(b.propertyIds) ? (b.propertyIds as unknown[]).map(String).slice(0, 50) : [],
    });
  } catch (e) {
    console.error("addEnquiry failed", e);
    return NextResponse.json({ error: "Could not send right now. Please try again or call us." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listEnquiries());
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = (await req.json()) as { id: string; status: string };
  if (!id || !["new", "contacted", "closed"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await updateEnquiry(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (id) await deleteEnquiry(id);
  return NextResponse.json({ ok: true });
}
