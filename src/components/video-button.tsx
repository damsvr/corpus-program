"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { embedUrl, movementKey, watchUrl, youtubeSearchUrl, type YoutubeRef } from "@/lib/video";

const VideoContext = createContext<Record<string, YoutubeRef>>({});

export function VideoProvider({ map, children }: { map: Record<string, YoutubeRef>; children: React.ReactNode }) {
  return <VideoContext.Provider value={map}>{children}</VideoContext.Provider>;
}

const iconBtn =
  "ml-2 inline-flex h-7 w-7 shrink-0 translate-y-[3px] items-center justify-center rounded-full border border-accent/40 text-accent active:scale-95";

const PlayIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
  </svg>
);

/**
 * Aperçu d'un mouvement : si le coach a enregistré une vidéo, elle se lit sur
 * place ; sinon le bouton ouvre la recherche YouTube du mouvement — il y a
 * donc toujours une vidéo à un tap, y compris pour une semaine fraîchement importée.
 */
export function VideoButton({ nom }: { nom: string }) {
  const video = useContext(VideoContext)[movementKey(nom)];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!video) {
    return (
      <a
        href={youtubeSearchUrl(nom)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Voir des vidéos : ${nom}`}
        title="Rechercher sur YouTube"
        className={iconBtn}
      >
        <PlayIcon />
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Voir la vidéo : ${nom}`} title="Voir la vidéo" className={`${iconBtn} bg-accent/15`}>
        <PlayIcon />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vidéo : ${nom}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-5 pt-4">
              <p className="text-sm font-bold uppercase leading-snug">{nom}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="-mr-2 -mt-1 px-2 py-1 text-xl leading-none text-muted">
                ×
              </button>
            </div>
            <div className="mt-3 aspect-video w-full bg-black">
              <iframe
                src={embedUrl(video)}
                title={`Vidéo : ${nom}`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs uppercase tracking-[0.12em]">
              <a href={watchUrl(video)} target="_blank" rel="noopener noreferrer" className="text-accent">
                Ouvrir dans YouTube
              </a>
              <a href={youtubeSearchUrl(nom)} target="_blank" rel="noopener noreferrer" className="text-muted">
                Autres vidéos
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
