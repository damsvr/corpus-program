import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { auth } from "@/auth";
import { loadShareData } from "@/lib/share-data";

export const runtime = "nodejs";

const W = 1080;
const H = 1920;

async function font(file: string) {
  const buf = await readFile(path.join(process.cwd(), "src/assets/fonts", file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Non connecté", { status: 401 });

  const { id } = await params;
  const data = await loadShareData(userId, id);
  if (!data) return new Response("Séance introuvable", { status: 404 });

  const sticker = new URL(req.url).searchParams.get("style") === "sticker";
  const shadow = sticker ? "0 2px 12px rgba(0,0,0,0.55)" : "none";
  const muted = sticker ? "#ffffff" : "#8fa3bd";

  const stat = (label: string, value: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 56 }}>
      <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: muted, textShadow: shadow, letterSpacing: 4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ display: "flex", fontSize: 110, fontWeight: 700, color: "#ffffff", textShadow: shadow, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins",
          color: "#ffffff",
          backgroundColor: sticker ? "transparent" : "#0f1a29",
          ...(sticker
            ? {}
            : { backgroundImage: `radial-gradient(circle at 50% 30%, ${data.accent}55 0%, #0f1a2900 60%)` }),
          padding: 90,
        }}
      >
        <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: 10, color: "#ffffff", textShadow: shadow }}>
          CORPUS PROGRAM
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 70,
            padding: "14px 44px",
            borderRadius: 999,
            backgroundColor: data.accent,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#000000",
          }}
        >
          {data.profileLabel.toUpperCase()}
        </div>

        <div style={{ display: "flex", marginTop: 48, fontSize: 150, fontWeight: 700, textShadow: shadow, textAlign: "center" }}>
          {data.patternLabel.toUpperCase()}
        </div>
        {data.movement && (
          <div style={{ display: "flex", fontSize: 46, fontWeight: 500, color: muted, textShadow: shadow, textAlign: "center", marginTop: 8 }}>
            {data.movement}
          </div>
        )}

        <div style={{ display: "flex", width: 160, height: 8, borderRadius: 4, backgroundColor: data.accent, marginTop: 56 }} />

        {stat("Temps", data.duration)}
        {stat("Calories (estim.)", `≈ ${data.calories} kcal`)}

        {data.performance.map((p) => (
          <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 44 }}>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 500, color: muted, textShadow: shadow, letterSpacing: 4 }}>
              {p.label.toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 58, fontWeight: 700, textShadow: shadow, textAlign: "center", marginTop: 4 }}>
              {p.value}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", marginTop: 80, fontSize: 34, fontWeight: 500, color: muted, textShadow: shadow }}>
          {data.date}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Poppins", data: await font("Poppins-Medium.ttf"), weight: 500, style: "normal" },
        { name: "Poppins", data: await font("Poppins-Bold.ttf"), weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
