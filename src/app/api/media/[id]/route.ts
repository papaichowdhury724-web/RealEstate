import { getMedia } from "@/lib/store";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const m = await getMedia(id);
  if (!m) return new Response("Not found", { status: 404 });
  const total = m.bytes.length;
  const headers: Record<string, string> = {
    "Content-Type": m.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };
  const range = req.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
      if (start <= end && start < total) {
        return new Response(new Uint8Array(m.bytes.subarray(start, end + 1)), {
          status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": String(end - start + 1) },
        });
      }
    }
  }
  return new Response(new Uint8Array(m.bytes), { headers: { ...headers, "Content-Length": String(total) } });
}
