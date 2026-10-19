import type { Performance, Session } from "./model";
export function groupedOrder(performances: Performance[]): Performance[] {
  const seen = new Set<string>();
  return performances.flatMap((p) => {
    if (!p.group) return [p];
    if (seen.has(p.group)) return [];
    seen.add(p.group);
    return performances.filter((q) => q.group === p.group);
  });
}
export function exerciseFacts(session: Session) {
  return {
    prescribed: session.prescription.exercises.length,
    prescribedPerformed: session.performances.filter(
      (p) =>
        p.origin === "prescribed" &&
        p.rows.some((r) => r.confirmed && r.actual),
    ).length,
    extraPerformed: session.performances.filter(
      (p) =>
        p.origin !== "prescribed" &&
        p.rows.some((r) => r.confirmed && r.actual),
    ).length,
    performed: session.performances.filter((p) =>
      p.rows.some((r) => r.confirmed && r.actual),
    ).length,
    highlights: session.performances
      .filter((p) => p.rows.some((r) => r.confirmed && r.actual))
      .map((p) => ({
        id: p.id,
        name: p.name,
        sets: p.rows.filter((r) => r.confirmed && r.actual).length,
        extra: p.origin !== "prescribed",
      })),
  };
}
