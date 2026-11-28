import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Aperçu du lien de la landing (Instagram, TikTok, WhatsApp, Messenger…), charte DS Coaching.
export const alt = "Corpus Program · DS Coaching : on ne fait pas ce qu'on veut, on fait ce qu'on peut";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function asset(...p: string[]) {
  return readFile(path.join(process.cwd(), "src/assets", ...p));
}
async function font(file: string) {
  const buf = await asset("fonts", file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export default async function OpengraphImage() {
  const logo = `data:image/jpeg;base64,${(await asset("brand", "ds-coaching.jpg")).toString("base64")}`;
  const grad = "linear-gradient(90deg, #ffc533, #ff3d2b)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#2d2d2f",
          padding: "64px 72px",
          fontFamily: "Poppins",
          color: "#f4f2ef",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={logo} width={96} height={96} style={{ borderRadius: 48 }} alt="" />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ backgroundImage: grad, backgroundClip: "text", color: "transparent" }}>CORPUS</span>
            <span style={{ marginLeft: 14 }}>PROGRAM</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.05 }}>On ne fait pas ce qu&apos;on veut.</div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.05,
              backgroundImage: grad,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            On fait ce qu&apos;on peut.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 28, fontWeight: 500 }}>
          <span style={{ color: "#c9c5bf" }}>CrossFit · Hyrox · Functional — pour parents de 35 ans et plus</span>
          <div style={{ display: "flex", height: 8, width: 120, borderRadius: 4, backgroundImage: grad }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: await font("Poppins-Bold.ttf"), weight: 700, style: "normal" },
        { name: "Poppins", data: await font("Poppins-Medium.ttf"), weight: 500, style: "normal" },
      ],
    },
  );
}
