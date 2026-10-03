/**
 * Regroupe les exercices d'un bloc de travail pour le repos : un exercice dont
 * `repos` indique « en superset avec … » fait partie du groupe de l'exercice
 * précédent, et le repos du groupe s'enclenche une fois le DERNIER mouvement
 * de la série validé.
 */
export function restGroups<T extends { repos: string | null }>(exercices: T[]): T[][] {
  const groups: T[][] = [];
  for (const e of exercices) {
    if (groups.length > 0 && e.repos && /super\s?set/i.test(e.repos)) groups[groups.length - 1].push(e);
    else groups.push([e]);
  }
  return groups;
}
