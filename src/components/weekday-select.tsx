"use client";

import { useTransition } from "react";
import { JOURS } from "@/lib/profiles";
import { setDayWeekday } from "@/app/(app)/aujourdhui/actions";

export function WeekdaySelect({
  dayId,
  value,
  readOnly = false,
}: {
  dayId: string;
  value: string | null;
  /** Programmation partagée : seul le coach peut la modifier. */
  readOnly?: boolean;
}) {
  const [pending, start] = useTransition();

  if (readOnly) {
    const label = JOURS.find((j) => j.key === value)?.label ?? "Jour libre";
    return (
      <span className="rounded-full border border-line px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
    );
  }

  return (
    <select
      aria-label="Jour de la semaine"
      defaultValue={value ?? ""}
      disabled={pending}
      onChange={(e) => start(() => setDayWeekday(dayId, e.target.value || null))}
      onClick={(e) => e.stopPropagation()}
      className="rounded-full border border-line bg-bg/70 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted outline-none focus:border-brand disabled:opacity-60"
    >
      <option value="">Jour libre</option>
      {JOURS.map((j) => (
        <option key={j.key} value={j.key}>
          {j.label}
        </option>
      ))}
    </select>
  );
}
