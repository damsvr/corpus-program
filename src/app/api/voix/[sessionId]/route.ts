import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeAudioMime, parseRange, VOICE_MAX_BYTES, VOICE_MAX_SECONDS } from "@/lib/voice";

export const runtime = "nodejs";

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
}

/** Envoi du message vocal : réservé à l'auteur de la séance, un message par séance (remplacé s'il existe). */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Non connecté", { status: 401 });
  const { sessionId } = await params;

  const owned = await db.sessionLog.findFirst({ where: { id: sessionId, userId: user.id }, select: { id: true } });
  if (!owned) return new Response("Séance introuvable", { status: 404 });

  const mime = normalizeAudioMime(req.headers.get("content-type"));
  if (!mime) return new Response("Format audio non accepté", { status: 415 });
  const declared = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (declared > VOICE_MAX_BYTES) return new Response("Message trop long", { status: 413 });

  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0) return new Response("Message vide", { status: 400 });
  if (data.length > VOICE_MAX_BYTES) return new Response("Message trop long", { status: 413 });

  const raw = parseInt(req.headers.get("x-duration-sec") ?? "0", 10);
  const durationSec = Math.min(VOICE_MAX_SECONDS, Math.max(1, Number.isFinite(raw) ? raw : 1));

  await db.sessionVoiceNote.upsert({
    where: { sessionId },
    create: { sessionId, mime, durationSec, data },
    update: { mime, durationSec, data },
  });
  return Response.json({ ok: true });
}

/** Lecture réservée au coach (le feedback est privé). Requêtes par intervalles gérées (Safari/iOS en a besoin pour lire un audio). */
export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Non connecté", { status: 401 });
  const { sessionId } = await params;

  if (user.role !== "COACH") return new Response("Introuvable", { status: 404 });
  const note = await db.sessionVoiceNote.findUnique({ where: { sessionId } });
  if (!note) return new Response("Introuvable", { status: 404 });

  const bytes = new Uint8Array(note.data);
  const headers: Record<string, string> = {
    "Content-Type": note.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  const range = parseRange(req.headers.get("range"), bytes.length);
  if (range === "invalid") return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
  if (range) {
    const part = bytes.slice(range.start, range.end + 1);
    return new Response(part, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${range.start}-${range.end}/${bytes.length}`, "Content-Length": String(part.length) },
    });
  }
  return new Response(bytes, { headers: { ...headers, "Content-Length": String(bytes.length) } });
}
