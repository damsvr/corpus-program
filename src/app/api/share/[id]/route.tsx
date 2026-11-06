import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { auth } from "@/auth";
import { CARD_SIZE, parseCardOptions, RATING_SCALE, type CardOptions, type Rating } from "@/lib/share-card";
import { loadShareData, type ShareData } from "@/lib/share-data";

export const runtime = "nodejs";

// Charte DS Coaching (logos dans src/assets/brand) : anthracite, dégradé jaune → rouge-orangé, blanc.
const INK = "#2d2d2f"; // fond exact du logo, pour qu'il se fonde dans la carte
const GRAD = "linear-gradient(135deg, #ffc533 0%, #ff7a2a 55%, #ff3d2b 100%)";
const SOFT = "rgba(255,255,255,0.72)";

async function asset(...p: string[]) {
  return readFile(path.join(process.cwd(), "src/assets", ...p));
}
async function font(file: string) {
  const buf = await asset("fonts", file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// Pictogrammes au trait (24×24), dessinés ici pour rester dans la charte et sans dépendance.
type Icon = "chrono" | "flamme" | "haltere" | "check" | "repeat" | "trophee" | "kettlebell" | "barre";
const ICON_PATHS: Record<Icon, string[]> = {
  chrono: ["M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 9v4l2.5 2.5", "M9 2h6", "M12 2v3"],
  flamme: ["M12 2c1 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9z"],
  haltere: ["M6 7v10", "M3 9.5v5", "M18 7v10", "M21 9.5v5", "M6 12h12"],
  check: ["M4.5 12.5l4.5 4.5L19.5 6.5"],
  repeat: ["M17 2l3 3-3 3", "M4 11V9a4 4 0 0 1 4-4h12", "M7 22l-3-3 3-3", "M20 13v2a4 4 0 0 1-4 4H4"],
  trophee: ["M8 4h8v5a4 4 0 0 1-8 0V4z", "M8 6H5a3 3 0 0 0 3 4", "M16 6h3a3 3 0 0 1-3 4", "M12 13v4", "M9 21h6", "M10 17h4v4h-4z"],
  kettlebell: ["M9 3h6a3 3 0 0 1 3 3l-1 3H7L6 6a3 3 0 0 1 3-3z", "M12 22a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z"],
  barre: ["M2 12h20", "M5 7v10", "M8 5v14", "M16 5v14", "M19 7v10"],
};

function Pict({ name, size, color, stroke = 2 }: { name: Icon; size: number; color: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

type Stat = { label: string; value: string; icon: Icon };

function iconFor(label: string): Icon {
  const l = label.toLowerCase();
  if (l.includes("wod")) return "trophee";
  if (l.includes("répét")) return "repeat";
  if (l.includes("validées")) return "check";
  return "haltere";
}

function stats(data: ShareData, o: CardOptions): Stat[] {
  const out: Stat[] = [];
  if (o.showDuration) out.push({ label: "Temps", value: data.duration, icon: "chrono" });
  if (o.showCalories) out.push({ label: "Kcal (estim.)", value: `≈ ${data.calories}`, icon: "flamme" });
  if (o.showPerformance) for (const p of data.performance) out.push({ ...p, icon: iconFor(p.label) });
  return out;
}

/** Nom de l'app mis en avant : « CORPUS » blanc, « PROGRAM » en dégradé, incliné comme le logo DS. */
function Wordmark({ size, shadow }: { size: number; shadow: string }) {
  const line = { display: "flex", fontSize: size, fontWeight: 700, lineHeight: 0.95, letterSpacing: Math.round(size * 0.06) } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", transform: "skewX(-9deg)" }}>
      <div style={{ ...line, color: "#ffffff", textShadow: shadow }}>CORPUS</div>
      <div style={{ ...line, backgroundImage: GRAD, backgroundClip: "text", color: "transparent", paddingRight: 12 }}>PROGRAM</div>
    </div>
  );
}

/** Titre façon logo DS : dégradé, gras, incliné. */
function GradTitle({ text, size }: { text: string; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.05,
        backgroundImage: GRAD,
        backgroundClip: "text",
        color: "transparent",
        transform: "skewX(-9deg)",
        paddingRight: 20,
      }}
    >
      {text.toUpperCase()}
    </div>
  );
}

function ProfilePill({ label, size }: { label: string; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        padding: `${Math.round(size * 0.3)}px ${Math.round(size * 0.9)}px`,
        backgroundImage: GRAD,
        transform: "skewX(-12deg)",
        borderRadius: 10,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 4,
        color: INK,
      }}
    >
      {label.toUpperCase()}
    </div>
  );
}

function StatTile({ s, k, shadow }: { s: Stat; k: number; shadow: string }) {
  const icon = Math.round(92 * k);
  return (
    <div style={{ display: "flex", alignItems: "center", width: "50%", marginBottom: Math.round(40 * k), paddingRight: 16 }}>
      <div
        style={{
          display: "flex",
          width: icon,
          height: icon,
          flexShrink: 0,
          borderRadius: 999,
          backgroundImage: GRAD,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pict name={s.icon} size={Math.round(icon * 0.55)} color={INK} stroke={2.4} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: Math.round(22 * k) }}>
        <div style={{ display: "flex", fontSize: Math.round(26 * k), fontWeight: 500, letterSpacing: 3, color: SOFT, textShadow: shadow }}>
          {s.label.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: Math.round((s.value.length > 12 ? 34 : 58) * k),
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#ffffff",
            textShadow: shadow,
            maxWidth: Math.round(360 * k),
          }}
        >
          {s.value}
        </div>
      </div>
    </div>
  );
}

/** Jauges de ressenti (1 à 5 points) notées par l'athlète ; une jauge non renseignée n'apparaît pas. */
function Gauges({ o, k, shadow }: { o: CardOptions; k: number; shadow: string }) {
  const keys = (["intensity", "satisfaction"] as Rating[]).filter((key) => o[key] > 0);
  if (!keys.length) return null;
  const dot = Math.round(30 * k);
  return (
    <div style={{ display: "flex", marginBottom: Math.round(36 * k) }}>
      {keys.map((key) => {
        const v = o[key];
        const { title } = RATING_SCALE[key];
        return (
          <div key={key} style={{ display: "flex", flexDirection: "column", width: "50%", paddingRight: 16 }}>
            <div style={{ display: "flex", fontSize: Math.round(26 * k), fontWeight: 500, letterSpacing: 3, color: SOFT, textShadow: shadow }}>
              {title.toUpperCase()}
            </div>
            <div style={{ display: "flex", marginTop: Math.round(12 * k) }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    width: dot,
                    height: dot,
                    marginRight: Math.round(12 * k),
                    borderRadius: 999,
                    ...(n <= v ? { backgroundImage: GRAD } : { border: `${Math.max(3, Math.round(4 * k))}px solid rgba(255,255,255,0.35)` }),
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Comment({ text, size, shadow }: { text: string; size: number; shadow: string }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", marginTop: 8 }}>
      <div style={{ display: "flex", width: 10, borderRadius: 5, backgroundImage: GRAD, flexShrink: 0 }} />
      <div style={{ display: "flex", fontSize: size, fontWeight: 500, lineHeight: 1.3, color: "#ffffff", marginLeft: 26, textShadow: shadow }}>
        {`“${text}”`}
      </div>
    </div>
  );
}

/** Logo DS Coaching : fondu dans le fond anthracite, ou en pastille arrondie sur photo / sticker. */
function Logo({ src, size, tile }: { src: string; size: number; tile: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img src={src} width={size} height={size} style={tile ? { borderRadius: Math.round(size * 0.22) } : {}} />;
}

/** Pictogrammes géants en filigrane, inclinés comme le monogramme SD. */
function Watermark({ h }: { h: number }) {
  const items: { name: Icon; x: number; y: number; s: number; r: number }[] = [
    { name: "kettlebell", x: 680, y: h * 0.14, s: 380, r: 14 },
    { name: "barre", x: -170, y: h * 0.34, s: 460, r: -24 },
    { name: "chrono", x: 760, y: h * 0.68, s: 360, r: 12 },
    { name: "haltere", x: -60, y: h * 0.78, s: 340, r: -20 },
  ];
  return (
    <>
      {items.map((it) => (
        <div
          key={it.name}
          style={{ position: "absolute", left: it.x, top: it.y, display: "flex", opacity: 0.07, transform: `rotate(${it.r}deg)` }}
        >
          <Pict name={it.name} size={it.s} color="#ffffff" stroke={1.4} />
        </div>
      ))}
    </>
  );
}

/** Fond DS Coaching (anthracite + filigrane) ou sticker transparent : même mise en page. */
function branded(data: ShareData, o: CardOptions, logo: string): ReactElement {
  const sticker = o.layout === "sticker";
  const story = o.format === "story";
  const k = story ? 1 : 0.78;
  const { height } = CARD_SIZE[o.format];
  const shadow = sticker ? "0 2px 12px rgba(0,0,0,0.6)" : "none";
  const tiles = stats(data, o).slice(0, story ? 5 : 4);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: sticker ? "transparent" : INK,
        padding: story ? "90px 84px 110px" : "56px 72px 64px",
        overflow: "hidden",
      }}
    >
      {!sticker && <Watermark h={height} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo src={logo} size={Math.round((sticker ? 150 : 210) * k)} tile={sticker} />
          <div style={{ display: "flex", marginLeft: Math.round((sticker ? 30 : 8) * k) }}>
            <Wordmark size={Math.round(74 * k)} shadow={shadow} />
          </div>
        </div>
        <ProfilePill label={data.profileLabel} size={Math.round(34 * k)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <GradTitle text={data.patternLabel} size={Math.round((story ? 170 : 140) * k)} />
        {data.movement && (
          <div style={{ display: "flex", fontSize: Math.round(44 * k), fontWeight: 500, color: SOFT, marginTop: 10, textShadow: shadow }}>
            {data.movement}
          </div>
        )}

        <div style={{ display: "flex", height: 12, width: 260, backgroundImage: GRAD, transform: "skewX(-20deg)", marginTop: Math.round(40 * k) }} />
        {tiles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: Math.round(52 * k) }}>
            {tiles.map((s) => (
              <StatTile key={s.label} s={s} k={k} shadow={shadow} />
            ))}
          </div>
        )}

        <Gauges o={o} k={k} shadow={shadow} />
        {o.comment && <Comment text={o.comment} size={Math.round(44 * k)} shadow={shadow} />}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: Math.round(28 * k), fontWeight: 500, color: SOFT, letterSpacing: 2, textShadow: shadow }}>
        <div style={{ display: "flex" }}>Le corps d&apos;abord. Le reste suit.</div>
        <div style={{ display: "flex" }}>{data.date}</div>
      </div>
    </div>
  );
}

/** Calque pour la photo de l'athlète : la photo reste visible en haut, infos en bas sur un voile anthracite. */
function photoOverlay(data: ShareData, o: CardOptions, logo: string): ReactElement {
  const story = o.format === "story";
  const k = story ? 1 : 0.82;
  const shadow = "0 2px 10px rgba(0,0,0,0.45)";
  const tiles = stats(data, o).slice(0, story ? 4 : 2);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Poppins",
        color: "#ffffff",
        padding: story ? "110px 72px 140px" : "56px 64px 64px",
        backgroundImage:
          "linear-gradient(180deg, rgba(45,45,47,0.6) 0%, rgba(45,45,47,0) 20%, rgba(45,45,47,0) 38%, rgba(45,45,47,0.88) 66%, rgba(45,45,47,0.97) 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo src={logo} size={Math.round(124 * k)} tile />
          <div style={{ display: "flex", marginLeft: Math.round(26 * k) }}>
            <Wordmark size={Math.round(58 * k)} shadow={shadow} />
          </div>
        </div>
        <ProfilePill label={data.profileLabel} size={Math.round(30 * k)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <GradTitle text={data.patternLabel} size={Math.round(130 * k)} />
        {data.movement && (
          <div style={{ display: "flex", fontSize: Math.round(40 * k), fontWeight: 500, color: SOFT, marginTop: 8, textShadow: shadow }}>
            {data.movement}
          </div>
        )}
        <div style={{ display: "flex", height: 10, width: 220, backgroundImage: GRAD, transform: "skewX(-20deg)", marginTop: Math.round(34 * k), marginBottom: Math.round(40 * k) }} />
        {tiles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {tiles.map((s) => (
              <StatTile key={s.label} s={s} k={k * 0.92} shadow={shadow} />
            ))}
          </div>
        )}
        <Gauges o={o} k={k * 0.92} shadow={shadow} />
        {o.comment && <Comment text={o.comment} size={Math.round(40 * k)} shadow={shadow} />}
        <div style={{ display: "flex", fontSize: Math.round(28 * k), fontWeight: 500, color: SOFT, marginTop: 24, textShadow: shadow }}>
          {data.date}
        </div>
      </div>
    </div>
  );
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Non connecté", { status: 401 });

  const { id } = await params;
  const data = await loadShareData(userId, id);
  if (!data) return new Response("Séance introuvable", { status: 404 });

  const o = parseCardOptions(new URL(req.url).searchParams);
  const { width, height } = CARD_SIZE[o.format];
  const logo = `data:image/jpeg;base64,${(await asset("brand", "ds-coaching.jpg")).toString("base64")}`;

  return new ImageResponse(o.layout === "photo" ? photoOverlay(data, o, logo) : branded(data, o, logo), {
    width,
    height,
    fonts: [
      { name: "Poppins", data: await font("Poppins-Medium.ttf"), weight: 500, style: "normal" },
      { name: "Poppins", data: await font("Poppins-Bold.ttf"), weight: 700, style: "normal" },
    ],
    headers: { "Cache-Control": "private, no-store" },
  });
}
