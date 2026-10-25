import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { uploadMedia } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 80 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 80MB)" }, { status: 413 });
  if (!/^(image|video)\//.test(file.type)) return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 415 });
  try {
    const url = await uploadMedia(file);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("upload failed", e);
    return NextResponse.json({ error: "Upload failed — check that Firebase Storage is enabled and storage.rules are published" }, { status: 500 });
  }
}
