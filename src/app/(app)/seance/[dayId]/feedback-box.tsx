"use client";

import { useEffect, useRef, useState } from "react";
import { COMMENT_MAX_CHARS, normalizeAudioMime, VOICE_BITRATE, VOICE_MAX_BYTES, VOICE_MAX_SECONDS } from "@/lib/voice";
import { formatClock } from "@/lib/wod-format";
import { usePressGuard } from "./timers";

export type VoiceDraft = { blob: Blob; mime: string; durationSec: number; url: string };
export type Feedback = { text: string; audio: VoiceDraft | null };

const MIME_CANDIDATES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];

function pickMime(): string | undefined {
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
}

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

/**
 * Retour de fin de séance : texte libre et/ou message vocal (voix seule,
 * 2 min max, bitrate réduit). Le brouillon reste ici ; l'envoi se fait avec
 * « Terminer la séance ».
 */
export function FeedbackBox({
  value,
  onChange,
  disabled,
}: {
  value: Feedback;
  onChange: (next: Feedback) => void;
  disabled?: boolean;
}) {
  const guard = usePressGuard();
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const latest = useRef(value);
  latest.current = value;
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  const releaseMic = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  // Quitter l'écran en plein enregistrement : on coupe le micro et on libère l'aperçu.
  useEffect(
    () => () => {
      if (recorder.current && recorder.current.state !== "inactive") recorder.current.onstop = null;
      recorder.current?.stop();
      releaseMic();
      if (latest.current.audio) URL.revokeObjectURL(latest.current.audio.url);
    },
    [],
  );

  const start = async () => {
    setError(null);
    if (latest.current.audio) URL.revokeObjectURL(latest.current.audio.url);
    onChange({ ...latest.current, audio: null });
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Micro refusé : autorise-le dans les réglages du navigateur, ou écris ton message.");
      return;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream.current, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: VOICE_BITRATE });
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      releaseMic();
      setRecording(false);
      const mime = normalizeAudioMime(rec.mimeType || mimeType);
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
      if (!mime || blob.size === 0) {
        setError("L'enregistrement n'a pas fonctionné sur cet appareil. Écris ton message.");
        return;
      }
      if (blob.size > VOICE_MAX_BYTES) {
        setError("Message trop long : réessaie en moins de 2 minutes.");
        return;
      }
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      onChange({ ...latest.current, audio: { blob, mime, durationSec, url: URL.createObjectURL(blob) } });
    };
    recorder.current = rec;
    rec.start();
    setElapsed(0);
    setRecording(true);
    timer.current = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(s);
      if (s >= VOICE_MAX_SECONDS && rec.state !== "inactive") rec.stop();
    }, 250);
  };

  const stop = () => {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  };

  const removeAudio = () => {
    if (value.audio) URL.revokeObjectURL(value.audio.url);
    onChange({ ...value, audio: null });
  };

  return (
    <section className="rounded-3xl border border-line bg-card p-5">
      <h3 className="flex items-start gap-3 text-base font-bold uppercase">
        <span className="grad-accent mt-1 h-5 w-1 shrink-0 rounded-full" />
        Feedback au coach
      </h3>
      <p className="mt-2 text-[0.8rem] text-muted">
        Sensations, douleurs, ce qui a coincé ou ce qui s&apos;est bien passé. Message privé : seul ton coach le reçoit, il le lit et
        l&apos;écoute pour ajuster la suite. Facultatif.
      </p>

      <textarea
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        maxLength={COMMENT_MAX_CHARS}
        rows={4}
        disabled={disabled}
        placeholder="Écris ton retour…"
        aria-label="Feedback au coach"
        className="mt-3 w-full rounded-2xl border border-line bg-bg/70 px-4 py-3 text-sm outline-none focus:border-brand"
      />
      {value.text.length > COMMENT_MAX_CHARS - 200 && (
        <p className="mt-1 text-right text-[0.68rem] text-muted">
          {value.text.length} / {COMMENT_MAX_CHARS}
        </p>
      )}

      {supported && !disabled && (
        <div className="mt-3">
          {recording ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-accent">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
                <span className="font-mono tabular-nums">
                  {formatClock(elapsed)} / {formatClock(VOICE_MAX_SECONDS)}
                </span>
              </span>
              <button
                type="button"
                onClick={guard(stop)}
                className="grad-accent rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black"
              >
                Arrêter
              </button>
            </div>
          ) : value.audio ? (
            <div className="space-y-2 rounded-2xl border border-line bg-bg/60 p-3">
              <audio controls src={value.audio.url} className="w-full" />
              <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                <span>Message vocal · {formatClock(value.audio.durationSec)}</span>
                <span className="flex gap-4">
                  <button type="button" onClick={guard(start)} className="text-accent">
                    Refaire
                  </button>
                  <button type="button" onClick={guard(removeAudio)}>
                    Supprimer
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={guard(start)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-accent"
            >
              <MicIcon />
              Enregistrer un message vocal
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-[0.78rem] text-red-300">{error}</p>}
    </section>
  );
}
