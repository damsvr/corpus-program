"use client";

import { useEffect, useRef, useState } from "react";
import {
  CARD_SIZE,
  cardQuery,
  COMMENT_MAX,
  RATING_SCALE,
  SHARE_TARGETS,
  type CardFormat,
  type CardLayout,
  type Rating,
  type ShareTarget,
} from "@/lib/share-card";

const ghost = "w-full rounded-full border border-line px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-muted disabled:opacity-60";

const checker = {
  backgroundColor: "#3a3a3a",
  backgroundImage: "conic-gradient(#555 25%, #3a3a3a 0 50%, #555 0 75%, #3a3a3a 0)",
  backgroundSize: "24px 24px",
};

/** Petites icônes monochromes (pas de logos de marque) : la couleur de la pastille suffit à reconnaître le réseau. */
const TARGET_STYLE: Record<ShareTarget["id"], { bg: string; fg: string; letter: string }> = {
  instagram: { bg: "linear-gradient(45deg,#f9a825,#e1306c 50%,#833ab4)", fg: "#fff", letter: "IG" },
  facebook: { bg: "#1877f2", fg: "#fff", letter: "f" },
  whatsapp: { bg: "#25d366", fg: "#fff", letter: "W" },
  snapchat: { bg: "#fffc00", fg: "#000", letter: "S" },
  tiktok: { bg: "#000", fg: "#fff", letter: "TT" },
  x: { bg: "#000", fg: "#fff", letter: "X" },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = src;
  });
}

/** Photo recadrée en « cover » sur la carte, calque Corpus par-dessus. JPEG : une photo en PNG pèserait plusieurs Mo. */
async function compose(photoUrl: string, overlay: Blob, format: CardFormat): Promise<Blob> {
  const { width, height } = CARD_SIZE[format];
  const overlayUrl = URL.createObjectURL(overlay);
  try {
    const [photo, layer] = await Promise.all([loadImage(photoUrl), loadImage(overlayUrl)]);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponible");
    const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
    const w = photo.naturalWidth * scale;
    const h = photo.naturalHeight * scale;
    ctx.drawImage(photo, (width - w) / 2, (height - h) / 2, w, h);
    ctx.drawImage(layer, 0, 0, width, height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export impossible"))), "image/jpeg", 0.9),
    );
  } finally {
    URL.revokeObjectURL(overlayUrl);
  }
}

export function SharePanel({ sessionId }: { sessionId: string }) {
  const [layout, setLayout] = useState<CardLayout>("fond");
  const [format, setFormat] = useState<CardFormat>("story");
  const [comment, setComment] = useState("");
  const [debouncedComment, setDebouncedComment] = useState("");
  const [show, setShow] = useState({ duration: true, calories: true, performance: true });
  const [ratings, setRatings] = useState<Record<Rating, number>>({ intensity: 0, satisfaction: 0 });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedComment(comment), 450);
    return () => clearTimeout(t);
  }, [comment]);

  useEffect(() => {
    const probe = new File([new Blob(["x"], { type: "image/png" })], "probe.png", { type: "image/png" });
    setCanShareFiles(Boolean(navigator.canShare?.({ files: [probe] })));
  }, []);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  // L'image finale est préparée à l'avance : au clic, navigator.share part tout de suite
  // (Safari refuse le partage si un téléchargement s'intercale après le geste).
  useEffect(() => {
    if (layout === "photo" && !photoUrl) {
      setPreview(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    let created: string | null = null;
    setLoading(true);
    (async () => {
      try {
        const q = cardQuery({
          layout,
          format,
          comment: debouncedComment,
          showDuration: show.duration,
          showCalories: show.calories,
          showPerformance: show.performance,
          intensity: ratings.intensity,
          satisfaction: ratings.satisfaction,
        });
        const res = await fetch(`/api/share/${sessionId}?${q}`);
        if (!res.ok) throw new Error("Image indisponible");
        const overlay = await res.blob();
        const blob = layout === "photo" && photoUrl ? await compose(photoUrl, overlay, format) : overlay;
        if (cancelled) return;
        const ext = blob.type === "image/jpeg" ? "jpg" : "png";
        const file = new File([blob], `corpus-seance-${layout}-${format}.${ext}`, { type: blob.type });
        created = URL.createObjectURL(blob);
        setPreview({ url: created, file });
        setMessage(null);
      } catch {
        if (!cancelled) setMessage("Impossible de préparer l'image, réessaie.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [sessionId, layout, format, debouncedComment, show, ratings, photoUrl]);

  const ready = Boolean(preview) && !loading && comment === debouncedComment;

  const download = (file: File) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const copyComment = () => {
    const text = comment.trim();
    if (text) navigator.clipboard?.writeText(text).catch(() => {});
    return text;
  };

  const shareTo = async (target: ShareTarget | null) => {
    if (!preview) return;
    const text = copyComment();
    const copied = text ? " Ton commentaire est copié : colle-le en légende." : "";
    if (canShareFiles) {
      try {
        await navigator.share({ files: [preview.file] });
        setMessage(target ? `Choisis ${target.label} dans la liste de partage.${copied}` : null);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) setMessage("Le partage a échoué, réessaie.");
      }
      return;
    }
    // Ordinateur : pas de partage de fichier natif, on enregistre l'image et on ouvre le réseau.
    download(preview.file);
    if (target) {
      window.open(target.webUrl(text), "_blank", "noopener");
      setMessage(`Image enregistrée : ajoute-la dans ta publication ${target.label}.${copied}`);
    } else {
      setMessage(`Image enregistrée.${copied}`);
    }
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPhotoUrl(URL.createObjectURL(f));
    setLayout("photo");
  };

  const pill = (active: boolean) =>
    `flex-1 rounded-full px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${
      active ? "grad-accent text-black" : "border border-line text-muted"
    }`;

  /** Jauge 1 à 5 en points ; retoucher la note choisie l'efface (jauge masquée sur la carte). */
  const gauge = (key: Rating) => {
    const { title, levels } = RATING_SCALE[key];
    const value = ratings[key];
    return (
      <div role="radiogroup" aria-label={title} className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted">{value ? levels[value - 1] : "Non affichée"}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} — ${levels[n - 1]}`}
              onClick={() => setRatings((r) => ({ ...r, [key]: r[key] === n ? 0 : n }))}
              className="flex h-11 flex-1 items-center justify-center"
            >
              <span
                className={`block h-6 w-6 rounded-full transition-colors ${n <= value ? "grad-accent" : "border-2 border-line"}`}
              />
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          <span>{levels[0]}</span>
          <span>{levels[4]}</span>
        </div>
      </div>
    );
  };

  const toggle = (key: keyof typeof show, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={show[key]}
        onChange={(e) => setShow((s) => ({ ...s, [key]: e.target.checked }))}
        className="h-4 w-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );

  const aspect = format === "story" ? "aspect-[9/16]" : "aspect-[4/5]";

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="eyebrow">Fond</p>
        <div className="flex gap-2">
          <button type="button" aria-pressed={layout === "photo"} className={pill(layout === "photo")}
            onClick={() => (photoUrl ? setLayout("photo") : photoInput.current?.click())}>
            Ma photo
          </button>
          <button type="button" aria-pressed={layout === "fond"} className={pill(layout === "fond")} onClick={() => setLayout("fond")}>
            DS Coaching
          </button>
          <button type="button" aria-pressed={layout === "sticker"} className={pill(layout === "sticker")} onClick={() => setLayout("sticker")}>
            Sticker
          </button>
        </div>
        <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        {layout === "photo" && photoUrl && (
          <button type="button" onClick={() => photoInput.current?.click()} className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
            Changer de photo
          </button>
        )}

        <p className="eyebrow pt-2">Format</p>
        <div className="flex gap-2">
          <button type="button" aria-pressed={format === "story"} className={pill(format === "story")} onClick={() => setFormat("story")}>
            Story 9:16
          </button>
          <button type="button" aria-pressed={format === "post"} className={pill(format === "post")} onClick={() => setFormat("post")}>
            Post 4:5
          </button>
        </div>
      </section>

      <div
        className={`relative mx-auto w-full max-w-[300px] overflow-hidden rounded-3xl border border-line ${aspect}`}
        style={layout === "fond" ? undefined : checker}
      >
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt="Aperçu de la carte de séance" className="block h-full w-full object-cover" />
        )}
        {layout === "photo" && !photoUrl && (
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white"
          >
            <span className="text-4xl">＋</span>
            Choisir une photo
          </button>
        )}
        {loading && <div className="absolute inset-0 animate-pulse bg-black/30" aria-hidden />}
      </div>
      {layout === "sticker" && (
        <p className="text-center text-xs text-muted">
          Enregistre le sticker, puis pose-le sur ta photo dans la story Instagram ou Snapchat.
        </p>
      )}

      <section className="space-y-3">
        <label htmlFor="share-comment" className="eyebrow block">
          Commentaire
        </label>
        <textarea
          id="share-comment"
          value={comment}
          maxLength={COMMENT_MAX}
          rows={2}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ex. : Nouveau record au squat 💪"
          className="w-full resize-none rounded-2xl border border-line bg-transparent px-4 py-3 text-base"
        />
        <p className="text-right text-xs text-muted">
          {Array.from(comment).length}/{COMMENT_MAX}
        </p>

        <p className="eyebrow">Données affichées</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {toggle("duration", "Durée")}
          {toggle("calories", "Calories")}
          {toggle("performance", "Performances")}
        </div>

        <p className="eyebrow pt-2">Ton ressenti</p>
        {gauge("intensity")}
        {gauge("satisfaction")}
      </section>

      <section className="space-y-3">
        <p className="eyebrow">Partager sur</p>
        <div className="grid grid-cols-3 gap-3">
          {SHARE_TARGETS.map((t) => {
            const s = TARGET_STYLE[t.id];
            return (
              <button
                key={t.id}
                type="button"
                disabled={!ready}
                onClick={() => void shareTo(t)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-line py-3 text-xs font-semibold disabled:opacity-50"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold"
                  style={{ background: s.bg, color: s.fg }}
                  aria-hidden
                >
                  {s.letter}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
        {canShareFiles && (
          <button type="button" disabled={!ready} onClick={() => void shareTo(null)} className={ghost}>
            Autre appli…
          </button>
        )}
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!preview) return;
            download(preview.file);
            setMessage(null);
          }}
          className={ghost}
        >
          Enregistrer l&apos;image
        </button>
      </section>
      {message && (
        <p role="status" className="text-center text-sm text-muted">
          {message}
        </p>
      )}
    </div>
  );
}
