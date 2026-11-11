"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { embedUrl, movementKey, watchUrl, youtubeSearchUrl, type YoutubeRef } from "@/lib/video";

const VideoContext = createContext<Record<string, YoutubeRef>>({});

export function VideoProvider({ map, children }: { map: Record<string, YoutubeRef>; children: React.ReactNode }) {
  return <VideoContext.Provider value={map}>{children}</VideoContext.Provider>;
}

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
  </svg>
);

function VideoDialog({ nom, video, onClose }: { nom: string; video: YoutubeRef; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vidéo : ${nom}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center"
      onClick={onClose}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <p className="text-sm font-bold uppercase leading-snug">{nom}</p>
          <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-2 -mt-1 px-2 py-1 text-xl leading-none text-muted">
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
  );
}

/**
 * Vignette d'un mouvement : miniature de la vidéo enregistrée par le coach
 * (lecture sur place), sinon une tuile ▶ qui ouvre la recherche YouTube du
 * mouvement — une vidéo reste donc toujours à un tap.
 */
export function MovementThumb({ nom, className = "" }: { nom: string; className?: string }) {
  const video = useContext(VideoContext)[movementKey(nom)];
  const [open, setOpen] = useState(false);

  const overlay = (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
        <PlayIcon />
      </span>
    </span>
  );

  if (!video) {
    return (
      <a
        href={youtubeSearchUrl(nom)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Voir des vidéos : ${nom}`}
        title="Rechercher sur YouTube"
        className={`relative block overflow-hidden bg-gradient-to-br from-card to-card2 text-accent/70 active:opacity-80 ${className}`}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40">
            <PlayIcon />
          </span>
        </span>
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Voir la vidéo : ${nom}`}
        className={`relative block overflow-hidden bg-black active:opacity-80 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
        {overlay}
      </button>
      {open && <VideoDialog nom={nom} video={video} onClose={() => setOpen(false)} />}
    </>
  );
}
