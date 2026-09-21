import type { BlocFull } from "@/lib/program";

function Note({ text }: { text: string }) {
  const isGate = /^\s*GATE\s*:/i.test(text);
  const isMarker = /^\s*MARQUEUR\s*:/i.test(text);
  return (
    <p
      className={`mt-2 rounded-xl px-3 py-2 text-[0.8rem] leading-relaxed ${
        isGate
          ? "bg-brand/10 text-brand"
          : isMarker
            ? "bg-accent/10 text-accent"
            : "bg-bg/60 text-muted"
      }`}
    >
      {text}
    </p>
  );
}

export function BlocCard({ bloc }: { bloc: BlocFull }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5">
      <h3 className="flex items-start gap-3 text-base font-bold uppercase leading-snug">
        <span className="grad-accent mt-1 h-5 w-1 shrink-0 rounded-full" />
        <span>
          {bloc.nom}
          {bloc.dureeMin && <span className="text-muted"> ({bloc.dureeMin}&apos;)</span>}
        </span>
      </h3>
      {bloc.formatEntete && (
        <p className="mt-3 rounded-xl bg-bg/60 px-3 py-2 text-[0.85rem] text-white/90">{bloc.formatEntete}</p>
      )}
      {bloc.note && <Note text={bloc.note} />}
      <ul className="mt-3 divide-y divide-line/70">
        {bloc.exercices.map((e) => (
          <li key={e.id} className="py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[0.95rem]">{e.nom}</span>
              <span className="shrink-0 text-right text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
                {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
              </span>
            </div>
            {e.note && <Note text={e.note} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
