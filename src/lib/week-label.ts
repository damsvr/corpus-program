type WeekRef = { blocNumero: number; semaineDansBloc: number };

/**
 * Libellé d'une semaine d'après son contenu (bloc + semaine dans le bloc), pas
 * d'après son rang d'import : `Week.numero` suit l'ordre dans lequel le coach
 * a importé les fichiers, donc une semaine 2 importée en premier s'appelait
 * « Week 01 » et semblait absente.
 */
export function weekLabel(w: WeekRef): string {
  return `Bloc ${w.blocNumero} · S${w.semaineDansBloc}`;
}

/** Ordre chronologique du programme : bloc puis semaine dans le bloc. */
export function compareWeeks(a: WeekRef, b: WeekRef): number {
  return a.blocNumero - b.blocNumero || a.semaineDansBloc - b.semaineDansBloc;
}
