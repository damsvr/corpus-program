import { Note } from "@/components/note";
import { blocDuration, blocStructure, splitBlocName } from "@/lib/bloc-view";

type HeaderBloc = {
  nom: string;
  dureeMin: string | null;
  formatEntete: string | null;
  note: string | null;
  isWod: boolean;
  exercices: { notation: string | null; repos: string | null }[];
};

/** Titre de section façon app de coaching : étiquette, gros titre accentué, durée / structure, note repliable. */
export function BlocHeader({ bloc, hideDuration = false }: { bloc: HeaderBloc; hideDuration?: boolean }) {
  const { eyebrow, title, subtitle } = splitBlocName(bloc.nom);
  const structure = blocStructure(bloc);
  const meta = [hideDuration ? null : blocDuration(bloc), structure].filter((x): x is string => !!x);
  // Le format complet n'est répété que pour ce que la ligne de structure ne dit pas
  // (consigne de score, précisions du coach) : tout ce qui suit le premier « — ».
  const [head, ...restParts] = (bloc.formatEntete ?? "").split(/\s[—–]\s/);
  const formatNote = [structure ? "" : head.trim(), restParts.join(" — ").trim()].filter(Boolean).join(" — ");
  return (
    <header>
      {eyebrow && <p className="eyebrow !text-brand">{eyebrow}</p>}
      <h3 className="mt-0.5 text-[1.6rem] font-extrabold uppercase leading-[1.1] tracking-tight text-accent">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
      {meta.length > 0 && <p className="mt-1.5 text-[0.82rem] font-medium text-white/85">{meta.join("  ·  ")}</p>}
      {formatNote && <Note text={formatNote} />}
      {bloc.note && <Note text={bloc.note} />}
    </header>
  );
}
