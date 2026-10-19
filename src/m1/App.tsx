import {
  draftWeight,
  draftUnit,
  loadBasis,
  setText,
  rowChanged,
  type WeightUnit,
} from "./units";
import { Icon, MediaPlaceholder, displayName } from "./visual";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  catalog,
  mediaLibrary,
  emptyDraft,
  demoSession,
  performance,
  type Model,
  type Performance,
  type Row,
} from "./model";
import * as db from "./storage";
import { lifecycle, elapsed, record, undo, comparable } from "./actions";
import { summary } from "./model";
import {
  readyTimer,
  startTimer,
  finishTimer,
  remaining,
  clock,
} from "../local/timer";
import { reschedule, schedule } from "../domain/scheduling";
import { MAX_BYTES } from "../local/backup";
import "./m1.css";
type DialogState = {
  kind: "info" | "library" | "settings" | "finish" | "duration" | "group";
  id?: string;
};
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const active = document.activeElement as HTMLElement;
    const y = window.scrollY;
    ref.current?.showModal();
    return () => {
      active?.focus({ preventScroll: true });
      window.scrollTo(0, y);
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-label={title}
    >
      <header>
        <h2>{title}</h2>
        <button aria-label="Close overlay" onClick={close}>
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
export default function App() {
  const [d, setD] = useState<Model | null>(null),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("Loading records…"),
    [dialog, setDialog] = useState<DialogState | null>(null),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [gear, setGear] = useState("All"),
    [now, setNow] = useState(Date.now()),
    [expanded, setExpanded] = useState(false),
    [complete, setComplete] = useState(false),
    [edits, setEdits] = useState<Record<string, Row["draft"]>>({}),
    [weightInputs, setWeightInputs] = useState<
      Record<string, { text: string; unit: WeightUnit; weight: string }>
    >({}),
    [focusedWeight, setFocusedWeight] = useState<string | null>(null),
    [preview, setPreview] = useState<Model | null>(null),
    [exported, setExported] = useState(-1),
    [duration, setDuration] = useState(""),
    [groupIds, setGroupIds] = useState<string[]>([]);
  const current = useRef<Model | null>(null),
    queue = useRef(Promise.resolve()),
    cancelAudio = useRef<AudioContext | null>(null),
    foreground = useRef(true),
    completionClaim = useRef<string | null>(null),
    inputFile = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void db
      .read()
      .then((x) => x ?? db.initialize())
      .then((x) => {
        current.current = x;
        setD(x);
        setSaved("Saved on this device");
      })
      .catch((e) => {
        setError(String(e));
        setSaved("Recovery needed — original records retained");
      });
    const timer = setInterval(() => setNow(Date.now()), 250);
    const visible = () => {
      if (
        current.current?.sessions.find(
          (s) => s.id === current.current!.view.session,
        )?.status === "active"
      )
        void write("last-seen", {}, (x) => {
          x.sessions.find((s) => s.id === x.view.session)!.lastSeen =
            Date.now();
        });
      foreground.current = false;
      cancelAudio.current?.close().catch(() => {});
      cancelAudio.current = null;
    };
    const vis = () => {
      if (document.hidden) visible();
      else foreground.current = false;
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", visible);
    const vv = () => {
      const v = window.visualViewport;
      document.documentElement.style.setProperty(
        "--keyboard",
        Math.max(
          0,
          window.innerHeight -
            (v?.height ?? window.innerHeight) -
            (v?.offsetTop ?? 0),
        ) + "px",
      );
    };
    window.visualViewport?.addEventListener("resize", vv);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pagehide", visible);
      window.visualViewport?.removeEventListener("resize", vv);
    };
  }, []);
  function write(action: string, payload: unknown, fn: (x: Model) => void) {
    setSaved("Saving…");
    queue.current = queue.current.then(async () => {
      const old = current.current;
      if (!old) return;
      try {
        const next = await db.change(old, action, payload, fn);
        current.current = next;
        setD(next);
        setSaved("Saved on this device");
        setError("");
      } catch (e) {
        setError(String(e));
        setSaved("Not saved — reload current records before editing");
      }
    });
    return queue.current;
  }
  const session = d?.sessions.find((s) => s.id === d.view.session);
  function changeSession(
    action: string,
    fn: (x: Model, s: NonNullable<typeof session>) => void,
  ) {
    const sid = session!.id;
    return write(action, { session: sid }, (x) => {
      const s = x.sessions.find((s) => s.id === sid);
      if (!s) throw Error("Session unavailable");
      fn(x, s);
    });
  }
  useEffect(() => {
    if (!d || d.timer.status !== "running" || remaining(d.timer, now) > 0)
      return;
    const run = d.timer.runId!;
    if (completionClaim.current === run) return;
    completionClaim.current = run;
    const canBeep =
      foreground.current &&
      document.visibilityState === "visible" &&
      now - d.timer.deadline! < 1500;
    void write("rest-completion", { run }, (x) => {
      if (x.timer.runId !== run) return;
      x.timer = finishTimer(x.timer, run, Date.now());
    }).then(() => {
      if (current.current?.timer.completedRunId !== run) return;
      setExpanded(false);
      setComplete(true);
      if (
        canBeep &&
        current.current.preferences.timer.alert === "short-beep" &&
        cancelAudio.current
      ) {
        const ctx = cancelAudio.current;
        const o = ctx.createOscillator(),
          gain = ctx.createGain();
        gain.gain.value = 0.07;
        o.connect(gain);
        gain.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.12);
      }
      setTimeout(() => setComplete(false), 2200);
    });
  }, [d, now]);
  async function download(model: Model) {
    const b = await db.exportBackup(model);
    saveFile(b, "Everyday-Athlete-M1-backup.json");
    setExported(model.revision);
  }
  function saveFile(value: unknown, name: string) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const matches = catalog.filter(
    (x) =>
      (category === "All" || x.category === category) &&
      (gear === "All" || x.equipment.some((e) => e === gear)) &&
      (x.name + " " + x.category + " " + x.equipment.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function library(add: boolean) {
    return (
      <>
        <p className="muted">Demo library · exercise media awaiting review.</p>
        <label>
          Search exercises
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Exercise, body area, equipment"
          />
        </label>
        <div className="category-chips" aria-label="Exercise categories">
          {[
            "All",
            "Full Body",
            "Lower Body",
            "Upper Body",
            "Core",
            "Mobility & Flexibility",
            "Cardio & Conditioning",
          ].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c === "All" ? "All exercises" : c}
            </button>
          ))}
        </div>
        <div className="filters">
          <label>
            Body area
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "All",
                "Full Body",
                "Lower Body",
                "Upper Body",
                "Core",
                "Mobility & Flexibility",
                "Cardio & Conditioning",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Equipment
            <select value={gear} onChange={(e) => setGear(e.target.value)}>
              {[
                "All",
                ...new Set(catalog.flatMap((x) => [...x.equipment])),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        {matches.map((item) => (
          <button
            className="library-row"
            aria-label={(add ? "Add " : "") + item.name}
            key={item.id}
            onClick={() => {
              if (add) {
                void changeSession("add-exercise", (x, s) => {
                  if (s.performances.length >= 30)
                    throw Error("30 exercise limit");
                  const e = demoSession(x.program).prescription.exercises.find(
                    (e) => e.identity.id === item.id,
                  ) ?? {
                    ...demoSession(x.program).prescription.exercises[0],
                    name: item.name,
                    identity: {
                      id: item.id,
                      version: 1,
                      variant: item.id,
                      equipment: [...item.equipment],
                      modality: item.modality,
                      loadKind: item.loadKind,
                      basis: item.basis,
                      unit: x.preferences.unit,
                      category: item.category,
                    },
                  };
                  s.performances.push(performance(e, true));
                });
                setDialog(null);
              } else setDialog({ kind: "info", id: item.id });
            }}
          >
            <MediaPlaceholder />
            <span>
              <strong>{displayName(item.name)}</strong>
              <small>
                {item.category} · {item.equipment.join(", ")}
              </small>
            </span>
            <span>{add ? "+" : "›"}</span>
          </button>
        ))}
        {!matches.length && <p>No matching synthetic exercises.</p>}
      </>
    );
  }
  if (!d || !session)
    return (
      <main className="m1">
        <h1>Everyday Athlete</h1>
        <p role="status">{saved}</p>
        {error && <p role="alert">{error}</p>}
        <button onClick={() => location.reload()}>Retry reading records</button>
        <button
          onClick={() =>
            void Promise.all([db.rawM1(), db.rawLegacy()]).then(
              ([m1, legacy]) =>
                saveFile({ m1, legacy }, "EA-raw-recovery-records.json"),
            )
          }
        >
          Export raw recovery records
        </button>
      </main>
    );
  const s = session;
  const totals = summary(s),
    time = elapsed(s, now),
    rest = remaining(d.timer, now);
  const finished = s.status.startsWith("finished");
  const blocked = /Another tab|Quota|Storage|database|limit|Backup/.test(error);
  function setDraft(
    p: Performance,
    r: Row,
    key: keyof Row["draft"],
    value: string,
  ) {
    const prior = edits[r.id] ?? r.draft;
    // A focus/unchanged input event must never persist a rounded conversion.
    if (
      key === "weight" &&
      value === draftWeight(p, r, prior, d!.preferences.unit, d!, true)
    )
      return;
    const draft = {
      ...prior,
      weightUnit: prior.weightUnit ?? draftUnit(p, r, d ?? undefined),
      [key]: value,
    };
    if (key === "weight") {
      draft.weightUnit = d!.preferences.unit;
      setWeightInputs((old) => ({
        ...old,
        [r.id]: { text: value, unit: d!.preferences.unit, weight: value },
      }));
    }
    setEdits((old) => ({ ...old, [r.id]: draft }));
    void changeSession("edit-draft", (_x, s) => {
      s.performances
        .find((e) => e.id === p.id)!
        .rows.find((a) => a.id === r.id)!.draft = draft;
    });
  }
  async function done(p: Performance, r: Row) {
    await queue.current;
    const live = current.current!.sessions.find((a) => a.id === s.id)!;
    if (live.status === "planned") {
      if (!window.confirm("Begin Workout now and record this set?")) return;
      await changeSession("begin-and-record", (x, a) =>
        lifecycle(x, a, "begin", Date.now()),
      );
    }
    await changeSession("record-set", (_x, a) => {
      const perf = a.performances.find((e) => e.id === p.id)!;
      const row = perf.rows.find((x) => x.id === r.id)!;
      record(a, perf, row, Date.now(), _x);
    });
  }
  function open(kind: DialogState["kind"], id?: string) {
    setDialog({ kind, id });
    setSearch("");
  }
  function stop() {
    cancelAudio.current?.close().catch(() => {});
    cancelAudio.current = null;
    setComplete(false);
    void write("rest-reset", {}, (x) => {
      x.timer = readyTimer(x.timer.selectedSeconds);
    });
  }
  return (
    <div className="m1">
      <header className="brand">
        <div>
          <span className="brand-mark" aria-hidden="true">
            <Icon name="workout" size={25} />
          </span>
          <div>
            <strong>
              Everyday<span>Athlete</span>
            </strong>
            <small>Synthetic workout preview</small>
          </div>
        </div>
        <button aria-label="Settings" onClick={() => open("settings")}>
          <Icon name="settings" />
        </button>
      </header>
      <div className="save-status" role="status">
        <span className="status-dot" aria-hidden="true" />
        {saved === "Saved on this device" ? "Saved" : saved}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
          <button
            onClick={() =>
              void db.read().then((x) => {
                if (x) {
                  current.current = x;
                  setD(x);
                  setEdits({});
                  setError("");
                  setSaved("Reloaded saved records");
                }
              })
            }
          >
            Reload saved records
          </button>
        </div>
      )}
      <main>
        {d.view.tab === "Workout" && (
          <>
            <section className="workout-head">
              <p className="eyebrow">
                {s.prescription.program === "strength"
                  ? "EVERYDAY STRENGTH"
                  : "EVERYDAY FOUNDATION"}{" "}
                · DEMO SESSION
              </p>
              <h1>
                {s.legacyStatus ? "Recovered workout" : "Today’s workout"}
              </h1>
              <p className="muted">
                {s.performances.length} exercises · {totals.done}/
                {totals.planned} sets logged
                {totals.extras > 0 ? ` · ${totals.extras} extra sets` : ""}
              </p>
              <div className="session-bar">
                <span>
                  Workout{" "}
                  {s.durationQuality === "unknown" && !s.correction
                    ? "unknown"
                    : clock(time.seconds)}
                  {time.review ? " · review needed" : ""}
                </span>
                <span className="badge">{s.status.replaceAll("_", " ")}</span>
              </div>
              <div className="actions">
                {s.status === "planned" && (
                  <button
                    className="primary"
                    disabled={blocked}
                    onClick={() =>
                      void changeSession("begin", (x, a) =>
                        lifecycle(x, a, "begin", Date.now()),
                      )
                    }
                  >
                    Begin Workout
                  </button>
                )}
                {s.status === "active" && (
                  <button
                    disabled={blocked}
                    onClick={() =>
                      void changeSession("pause", (x, a) =>
                        lifecycle(x, a, "pause", Date.now()),
                      )
                    }
                  >
                    Pause Workout
                  </button>
                )}
                {s.status === "paused" && (
                  <button
                    className="primary"
                    disabled={blocked}
                    onClick={() =>
                      void changeSession("resume", (x, a) =>
                        lifecycle(x, a, "resume", Date.now()),
                      )
                    }
                  >
                    Resume Workout
                  </button>
                )}
                {!finished && (
                  <button disabled={blocked} onClick={() => open("finish")}>
                    Finish Workout
                  </button>
                )}
                {(time.review || finished) && (
                  <button onClick={() => open("duration")}>
                    Review duration
                  </button>
                )}
              </div>
              {time.review && (
                <p className="notice">
                  Recorded elapsed time needs review. This is not measured
                  exercise time. Continue, pause, finish, or correct the
                  duration.
                </p>
              )}
            </section>
            {s.performances.map((p) => {
              const collapsed = d.view.collapsed[p.id];
              const last = comparable(d, s, p);
              const prescribed = s.prescription.exercises.find(
                (exercise) => exercise.id === p.prescriptionExerciseId,
              );
              const targets = [
                ...new Set(prescribed?.sets.map((set) => set.target) ?? []),
              ];
              return (
                <section
                  className={
                    "exercise-card" +
                    (collapsed ? " card-collapsed" : "") +
                    (p.rows.every((r) => r.confirmed) ? " card-complete" : "")
                  }
                  key={p.id}
                  aria-label={p.name}
                >
                  <header>
                    <button
                      className="exercise-title"
                      aria-expanded={!collapsed}
                      onClick={() =>
                        void write("collapse", { id: p.id }, (x) => {
                          x.view.collapsed[p.id] = !collapsed;
                        })
                      }
                    >
                      <MediaPlaceholder />
                      <span>
                        <strong>{displayName(p.name)}</strong>
                        <span className="prescription-line">
                          {p.rows.filter((r) => r.origin === "prescribed")
                            .length || p.rows.length}{" "}
                          sets ·{" "}
                          {p.identity.modality === "time"
                            ? "Time-based"
                            : "Reps"}
                        </span>
                        <small>
                          {p.identity.equipment.join(" · ")} ·{" "}
                          {p.identity.category}
                        </small>
                        <small>{loadBasis(p)}</small>
                      </span>
                      <span className="card-toggle">
                        {p.rows.every((r) => r.confirmed) && (
                          <Icon name="check" size={17} />
                        )}
                        <Icon name="chevron" size={17} />
                      </span>
                    </button>
                    <button
                      aria-label={"Information for " + p.name}
                      onClick={() => open("info", p.identity.id)}
                    >
                      <Icon name="info" size={20} />
                    </button>
                  </header>
                  <div className="exercise-meta">
                    <span>
                      {p.rows.filter((r) => r.confirmed).length}/{p.rows.length}{" "}
                      sets logged
                      {p.origin !== "prescribed" ? " · extra exercise" : ""}
                    </span>
                    {p.group && (
                      <span className="group">
                        {p.group}
                        {s.performances
                          .filter((a) => a.group === p.group)
                          .findIndex((a) => a.id === p.id) + 1}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <>
                      <div className="last-target">
                        <span>
                          <b>Last Time</b>{" "}
                          {last
                            ? last
                                .map((v) => setText(v, d.preferences.unit))
                                .join(" / ")
                            : "No recorded sets yet"}
                        </span>
                        <span>
                          <b>Today’s Target</b>
                          {targets.length ? (
                            <details className="target-explanation">
                              <summary>
                                {p.identity.modality === "time"
                                  ? "Demo duration"
                                  : "Demo reps"}{" "}
                                · details
                              </summary>
                              <span>
                                {targets.join(" · ")}. Synthetic prescription;
                                no progression advice.
                                {prescribed?.sets.map((set) =>
                                  set.suggested ? (
                                    <span
                                      key={set.id}
                                      className="prescribed-load"
                                    >
                                      {setText(
                                        set.suggested,
                                        d.preferences.unit,
                                      )}
                                    </span>
                                  ) : null,
                                )}
                              </span>
                            </details>
                          ) : (
                            "No prescribed target"
                          )}
                        </span>
                      </div>
                      <div className="set-head">
                        <span>Set</span>
                        <span>
                          {[
                            "external",
                            "assisted",
                            "added_bodyweight",
                          ].includes(p.identity.loadKind)
                            ? `Weight (${d.preferences.unit})`
                            : "Load"}
                        </span>
                        <span>
                          {p.identity.modality === "time" ? "Seconds" : "Reps"}
                        </span>
                        <span>Done</span>
                      </div>
                      {p.rows.map((r, i) => {
                        const draft = edits[r.id] ?? r.draft;
                        const changed =
                          r.confirmed && rowChanged(p, r, draft, d);
                        const entry = weightInputs[r.id];
                        return (
                          <div
                            className={
                              "set-wrap " + (r.confirmed ? "is-done" : "")
                            }
                            key={r.id}
                          >
                            <div className="set-row">
                              <span>
                                {i + 1}
                                {r.origin !== "prescribed" ? " +" : ""}
                              </span>
                              {[
                                "external",
                                "assisted",
                                "added_bodyweight",
                              ].includes(p.identity.loadKind) ? (
                                <input
                                  aria-label={`${p.name} set ${i + 1} weight`}
                                  inputMode="decimal"
                                  value={
                                    entry &&
                                    entry.unit === d.preferences.unit &&
                                    entry.weight === draft.weight
                                      ? entry.text
                                      : draftWeight(
                                          p,
                                          r,
                                          draft,
                                          d.preferences.unit,
                                          d,
                                          focusedWeight === r.id,
                                        )
                                  }
                                  onFocus={() => setFocusedWeight(r.id)}
                                  onBlur={() => setFocusedWeight(null)}
                                  onChange={(e) =>
                                    setDraft(p, r, "weight", e.target.value)
                                  }
                                  disabled={blocked}
                                />
                              ) : (
                                <span className="load-label">
                                  {p.identity.loadKind === "bodyweight"
                                    ? "BW"
                                    : "—"}
                                </span>
                              )}
                              <input
                                aria-label={`${p.name} set ${i + 1} ${p.identity.modality === "time" ? "seconds" : "reps"}`}
                                inputMode="numeric"
                                value={draft.amount}
                                onChange={(e) =>
                                  setDraft(p, r, "amount", e.target.value)
                                }
                                disabled={blocked}
                              />
                              <button
                                className={r.confirmed ? "done" : "set-confirm"}
                                disabled={blocked || s.status === "paused"}
                                onClick={() => {
                                  if (r.confirmed && !changed) {
                                    void changeSession("undo-set", (_x, a) =>
                                      undo(
                                        a,
                                        a.performances
                                          .find((x) => x.id === p.id)!
                                          .rows.find((x) => x.id === r.id)!,
                                      ),
                                    );
                                  } else void done(p, r);
                                }}
                              >
                                {r.confirmed && !changed && (
                                  <Icon name="check" size={12} />
                                )}
                                {r.confirmed
                                  ? changed
                                    ? "Save edit"
                                    : "Undo"
                                  : "Done"}
                              </button>
                            </div>
                            {d.preferences.rir && (
                              <label className="rir">
                                RIR (optional)
                                <input
                                  aria-label={`${p.name} set ${i + 1} RIR`}
                                  inputMode="numeric"
                                  value={draft.rir}
                                  onChange={(e) =>
                                    setDraft(p, r, "rir", e.target.value)
                                  }
                                />
                                <span>
                                  Reps you could still perform; blank stays
                                  unknown.
                                </span>
                              </label>
                            )}
                            {r.confirmed && (
                              <small className="actual">
                                Recorded:{" "}
                                {r.actual
                                  ? setText(r.actual, d.preferences.unit, false)
                                  : ""}
                                {changed ? " · draft edit not recorded" : ""}
                              </small>
                            )}
                          </div>
                        );
                      })}
                      <button
                        className="add-set"
                        disabled={blocked || p.rows.length >= 20}
                        onClick={() =>
                          void changeSession("add-set", (_x, a) => {
                            const perf = a.performances.find(
                              (x) => x.id === p.id,
                            )!;
                            perf.rows.push({
                              id: crypto.randomUUID(),
                              plannedSetId: null,
                              origin:
                                perf.origin === "added_exercise"
                                  ? "added_exercise"
                                  : "added_set",
                              draft: emptyDraft(),
                              actual: null,
                              confirmed: false,
                              revision: 0,
                              recordedAt: null,
                            });
                          })
                        }
                      >
                        + Add Set
                      </button>
                    </>
                  )}
                </section>
              );
            })}
            <div className="workout-footer">
              <button
                onClick={() => open("library")}
                disabled={blocked || s.performances.length >= 30}
              >
                + Add Exercise
              </button>
              <button onClick={() => open("group")}>
                Group / unlink supersets
              </button>
              {!finished && (
                <button
                  className="primary"
                  disabled={blocked}
                  onClick={() => open("finish")}
                >
                  Finish Workout
                </button>
              )}
            </div>
            {finished && (
              <section className="panel">
                <h2>
                  {s.status === "finished_full"
                    ? "Prescribed sets recorded"
                    : "Workout finished as partial"}
                </h2>
                <p>
                  {totals.done} of {totals.planned} prescribed sets ·{" "}
                  {totals.extras} extras. Unperformed sets remain incomplete.
                </p>
                <button
                  onClick={() =>
                    void write("new-session", {}, (x) => {
                      const next = demoSession(x.program);
                      x.sessions.push(next);
                      x.view.session = next.id;
                    })
                  }
                >
                  New synthetic workout
                </button>
              </section>
            )}
          </>
        )}
        {d.view.tab === "Visuals" && (
          <section className="panel">
            <p className="eyebrow">FIND YOUR MOVEMENT</p>
            <h1>Visuals</h1>
            {library(false)}
          </section>
        )}
        {d.view.tab === "Program" && (
          <section className="panel">
            <p className="eyebrow">YOUR PROGRAM</p>
            <h1>Keep your rhythm.</h1>
            <p>
              Foundation and Strength are synthetic software fixtures. Real
              program prescriptions await qualified review.
            </p>
            {(["foundation", "strength"] as const).map((program) => (
              <button
                className="library-row"
                key={program}
                onClick={() =>
                  void write("select-program", { program }, (x) => {
                    x.program = program;
                  })
                }
              >
                <span>
                  <strong>
                    Everyday{" "}
                    {program === "foundation" ? "Foundation" : "Strength"}
                  </strong>
                  <small>
                    {program === "foundation" ? 3 : 4} days / week ·{" "}
                    {d.program === program ? "selected" : "select"}
                  </small>
                </span>
              </button>
            ))}
            <p>
              Changing the selected program keeps all current sessions.
              Equipment belongs to each exercise and workout; it is not a
              permanent onboarding restriction.
            </p>
            <button
              onClick={() =>
                void write("create-schedule", {}, (x) => {
                  if (x.slots.length) throw Error("Existing schedule retained");
                  const days = x.program === "foundation" ? 3 : 4;
                  x.slots = schedule({
                    start: new Date().toISOString().slice(0, 10),
                    weekdays: days === 3 ? [1, 3, 5] : [1, 2, 4, 5],
                    days,
                    count: days,
                    minimumGapDays: 1,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  });
                  for (const slot of x.slots)
                    x.sessions.push(demoSession(x.program, slot.id));
                })
              }
            >
              Create synthetic schedule
            </button>
            <h2>Saved sessions</h2>
            {d.sessions.map((a) => (
              <button
                className="library-row"
                key={a.id}
                onClick={() =>
                  void write("select-session", { id: a.id }, (x) => {
                    x.view.session = a.id;
                    x.view.tab = "Workout";
                  })
                }
              >
                <span>
                  {a.prescription.program}
                  <small>
                    {a.status.replaceAll("_", " ")} · {summary(a).done}/
                    {summary(a).planned}
                  </small>
                </span>
                <span>›</span>
              </button>
            ))}
            <button
              onClick={() =>
                void write("new-session", {}, (x) => {
                  const next = demoSession(x.program);
                  x.sessions.push(next);
                  x.view.session = next.id;
                  x.view.tab = "Workout";
                })
              }
            >
              Create synthetic workout
            </button>
            {d.slots.length > 0 && (
              <>
                <h2>Preserved legacy schedule</h2>
                {d.slots.map((slot) => (
                  <p key={slot.id}>
                    <label>
                      Planned date for slot {slot.ordinal}
                      <input
                        type="date"
                        value={slot.plannedDate}
                        onChange={(e) =>
                          void write(
                            "reschedule",
                            { slot: slot.id, date: e.target.value },
                            (x) => {
                              x.slots = reschedule(
                                x.slots,
                                slot.id,
                                e.target.value,
                                1,
                                slot.revision,
                                [1, 3, 5],
                              );
                            },
                          )
                        }
                      />
                    </label>{" "}
                    · {slot.status}
                  </p>
                ))}
              </>
            )}
          </section>
        )}
        {d.view.tab === "Progress" && (
          <section className="panel">
            <p className="eyebrow">ACTUAL RECORDS ONLY</p>
            <h1>Your progress</h1>
            {d.sessions.filter((a) => a.status.startsWith("finished"))
              .length === 0 && (
              <p>
                No finished workouts yet. Draft entries are not accomplishments.
              </p>
            )}
            {d.sessions
              .filter((a) => a.status.startsWith("finished"))
              .map((a) => (
                <button
                  className="library-row"
                  key={a.id}
                  onClick={() =>
                    void write("review-session", { id: a.id }, (x) => {
                      x.view.session = a.id;
                      x.view.tab = "Workout";
                    })
                  }
                >
                  <span>
                    <strong>
                      {a.status === "finished_full"
                        ? "Full prescribed record"
                        : "Partial workout"}
                    </strong>
                    <small>
                      {a.performedDate} · {summary(a).done}/{summary(a).planned}{" "}
                      prescribed · {summary(a).extras} extras ·{" "}
                      {elapsed(a, now).review
                        ? "duration unverified"
                        : clock(elapsed(a, now).seconds)}
                    </small>
                    <small className="progress-loads">
                      {a.performances
                        .filter((p) => p.rows.some((r) => r.confirmed))
                        .map((p) => (
                          <span key={p.id}>
                            {displayName(p.name)}:{" "}
                            {p.rows
                              .filter((r) => r.confirmed && r.actual)
                              .map((r) =>
                                setText(r.actual!, d.preferences.unit),
                              )
                              .join(" / ")}
                          </span>
                        ))}
                    </small>
                  </span>
                </button>
              ))}
          </section>
        )}
      </main>
      <aside
        className={
          "rest-dock " +
          (complete
            ? "complete"
            : rest <= 10 && d.timer.status === "running"
              ? "amber"
              : "")
        }
        aria-label="Rest timer"
      >
        <div className="rest-bar">
          <button
            aria-label={`${expanded ? "Collapse" : "Expand"} rest timer: ${complete ? "Rest complete" : d.timer.status === "running" ? "Rest" : "Ready"} ${clock(rest)}`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="mini-ring" aria-hidden="true" />{" "}
            <span>
              {complete
                ? "Rest complete"
                : d.timer.status === "running"
                  ? "Rest"
                  : "Ready"}{" "}
              <b>{clock(rest)}</b>
            </span>
          </button>
          {d.timer.status === "ready" ? (
            <button
              className="primary"
              onClick={() => {
                foreground.current = true;
                completionClaim.current = null;
                if (d.preferences.timer.alert === "short-beep") {
                  try {
                    cancelAudio.current = new AudioContext();
                    void cancelAudio.current.resume();
                  } catch {
                    cancelAudio.current = null;
                  }
                }
                void write("rest-start", {}, (x) => {
                  x.timer = startTimer(
                    x.timer,
                    Date.now(),
                    crypto.randomUUID(),
                  );
                });
              }}
            >
              Start
            </button>
          ) : (
            <button aria-label="Stop and reset rest timer" onClick={stop}>
              ×
            </button>
          )}
        </div>
        {expanded && (
          <div className="rest-options">
            <div
              className="radial"
              role="img"
              aria-label={`${clock(rest)} remaining`}
            >
              <svg viewBox="0 0 110 110" aria-hidden="true">
                <circle
                  cx="55"
                  cy="55"
                  r="51"
                  fill="none"
                  stroke="#25364d"
                  strokeWidth="6"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="51"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="320.44"
                  strokeDashoffset={
                    320.44 * (1 - rest / d.timer.selectedSeconds)
                  }
                  transform="rotate(-90 55 55)"
                />
              </svg>
              <strong>{clock(rest)}</strong>
            </div>
            <div className="presets">
              {[30, 60, 120, 180].map((seconds) => (
                <button
                  disabled={d.timer.status === "running"}
                  key={seconds}
                  onClick={() =>
                    void write("rest-duration", { seconds }, (x) => {
                      x.timer = readyTimer(seconds);
                    })
                  }
                >
                  {seconds === 30 ? "30s" : seconds / 60 + "m"}
                </button>
              ))}
            </div>
            <div className="adjust">
              <button
                aria-label="Subtract five seconds"
                disabled={d.timer.status === "running" || rest <= 5}
                onClick={() =>
                  void write("rest-adjust", { delta: -5 }, (x) => {
                    x.timer = readyTimer(x.timer.selectedSeconds - 5);
                  })
                }
              >
                −5s
              </button>
              <span>{clock(d.timer.selectedSeconds)}</span>
              <button
                aria-label="Add five seconds"
                disabled={d.timer.status === "running" || rest >= 3600}
                onClick={() =>
                  void write("rest-adjust", { delta: 5 }, (x) => {
                    x.timer = readyTimer(x.timer.selectedSeconds + 5);
                  })
                }
              >
                +5s
              </button>
            </div>
            <button onClick={stop}>Stop &amp; Reset</button>
          </div>
        )}
      </aside>
      <nav className="bottom-nav" aria-label="Main navigation">
        {(["Workout", "Program", "Visuals", "Progress"] as const).map(
          (tab, i) => (
            <button
              aria-current={d.view.tab === tab ? "page" : undefined}
              key={tab}
              onClick={() =>
                void write("tab", { tab }, (x) => {
                  x.view.tab = tab;
                })
              }
            >
              <Icon
                name={
                  (["workout", "program", "visuals", "progress"] as const)[i]
                }
              />
              {tab}
            </button>
          ),
        )}
      </nav>
      {dialog && (
        <Modal
          title={
            dialog.kind === "settings"
              ? "Settings"
              : dialog.kind === "library"
                ? "Add Exercise"
                : dialog.kind === "finish"
                  ? "Finish Workout"
                  : dialog.kind === "duration"
                    ? "Review workout duration"
                    : dialog.kind === "group"
                      ? "Manual supersets"
                      : "Exercise information"
          }
          close={() => setDialog(null)}
        >
          {dialog.kind === "library" && library(true)}
          {dialog.kind === "info" && (
            <>
              <h3>
                {displayName(
                  catalog.find((x) => x.id === dialog.id)?.name ??
                    dialog.id ??
                    "Exercise",
                )}
              </h3>
              <p className="media-note">
                Media awaiting rights &amp; technique review. This preview does
                not provide form instruction.
              </p>
              <div className="frames">
                {(mediaLibrary[dialog.id ?? ""] ?? []).map((frame) => (
                  <figure key={frame.id}>
                    <div className="frame">
                      <MediaPlaceholder large />
                      <span className="frame-step">
                        {frame.order + 1} /{" "}
                        {mediaLibrary[dialog.id ?? ""]?.length}
                      </span>
                    </div>
                    <figcaption>{frame.caption}</figcaption>
                  </figure>
                ))}
              </div>
              <details>
                <summary>Additional details</summary>
                <p>
                  Reviewed demonstrations will show each position with a short
                  caption. More than three frames can be used for movements that
                  need them.
                </p>
              </details>
            </>
          )}
          {dialog.kind === "finish" && (
            <>
              <div className="finish-intro">
                <Icon name="check" size={28} />
                <h3>Your work, recorded.</h3>
                <p>Finish what you did. Keep the rest honest.</p>
              </div>
              <div className="summary-grid">
                <div>
                  <span>Prescribed sets</span>
                  <strong>
                    {totals.done}
                    <small> / {totals.planned}</small>
                  </strong>
                </div>
                <div>
                  <span>Additional sets</span>
                  <strong>{totals.extras}</strong>
                </div>
                <div>
                  <span>Not completed</span>
                  <strong>{totals.planned - totals.done}</strong>
                </div>
                <div>
                  <span>Workout time</span>
                  <strong>
                    {time.review ? "Needs review" : clock(time.seconds)}
                  </strong>
                </div>
              </div>
              <p>
                {totals.done}/{totals.planned} prescribed sets recorded ·{" "}
                {totals.extras} extra sets.{" "}
                {totals.done < totals.planned
                  ? "This workout has outstanding prescribed work."
                  : ""}
              </p>
              <button
                className="primary"
                onClick={() => {
                  void changeSession("finish", (x, a) =>
                    lifecycle(x, a, "finish", Date.now(), true),
                  );
                  setDialog(null);
                }}
              >
                {totals.done < totals.planned
                  ? "Finish as partial"
                  : "Finish full workout"}
              </button>
              {s.status === "active" && (
                <button
                  onClick={() => {
                    void changeSession("pause", (x, a) =>
                      lifecycle(x, a, "pause", Date.now()),
                    );
                    setDialog(null);
                  }}
                >
                  Keep paused for later
                </button>
              )}
              <button onClick={() => setDialog(null)}>Continue workout</button>
            </>
          )}
          {dialog.kind === "duration" && (
            <>
              <p>
                Keep raw active intervals. Correcting this number does not infer
                effort or alter recorded sets.
              </p>
              <label>
                Corrected duration in minutes
                <input
                  inputMode="decimal"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>
              <button
                onClick={() => {
                  if (
                    !duration.trim() ||
                    !Number.isFinite(+duration) ||
                    +duration < 0
                  ) {
                    setError("Enter a valid nonnegative duration");
                    return;
                  }
                  void changeSession("correct-duration", (_x, a) => {
                    a.correction = {
                      seconds: +duration * 60,
                      at: Date.now(),
                      reason: "Owner corrected recorded elapsed duration",
                    };
                    a.durationQuality = "known";
                    a.lastSeen = Date.now();
                  });
                  setDialog(null);
                }}
              >
                Save duration correction
              </button>
              {s.status === "active" && (
                <button
                  onClick={() => {
                    void changeSession("acknowledge-duration", (_x, a) => {
                      a.lastSeen = Date.now();
                      a.durationQuality = "known";
                    });
                    setDialog(null);
                  }}
                >
                  Continue current active interval
                </button>
              )}
            </>
          )}
          {dialog.kind === "group" && (
            <>
              <p>
                Choose exercises to label A1/A2. This does not recommend
                pairings, shorten rest, or change records.
              </p>
              {s.performances.map((p) => (
                <label className="check" key={p.id}>
                  <input
                    type="checkbox"
                    checked={groupIds.includes(p.id)}
                    onChange={(e) =>
                      setGroupIds((ids) =>
                        e.target.checked
                          ? [...ids, p.id]
                          : ids.filter((id) => id !== p.id),
                      )
                    }
                  />
                  {p.name}
                </label>
              ))}
              <button
                disabled={groupIds.length < 2}
                onClick={() => {
                  void changeSession("manual-group", (_x, a) => {
                    for (const p of a.performances)
                      p.group = groupIds.includes(p.id) ? "A" : null;
                  });
                  setGroupIds([]);
                  setDialog(null);
                }}
              >
                Group selected
              </button>
              <button
                onClick={() => {
                  void changeSession("unlink-group", (_x, a) => {
                    for (const p of a.performances) p.group = null;
                  });
                  setDialog(null);
                }}
              >
                Unlink all groups
              </button>
            </>
          )}
          {dialog.kind === "settings" && (
            <>
              <label>
                Weight units
                <select
                  value={d.preferences.unit}
                  onChange={(e) => {
                    const unit = e.target.value as WeightUnit;
                    void write("weight-display-unit", { unit }, (x) => {
                      x.preferences.unit = unit;
                    });
                  }}
                >
                  <option value="lb">Pounds (lb)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </label>
              <p className="muted">
                Display and entry units. Your recorded weights keep their
                original units. Converted displays round to 0.1; saved precision
                is retained.
              </p>
              <label className="check">
                <input
                  type="checkbox"
                  checked={d.preferences.rir}
                  onChange={(e) =>
                    void write("rir", { value: e.target.checked }, (x) => {
                      x.preferences.rir = e.target.checked;
                    })
                  }
                />
                Show optional RIR
              </label>
              <label>
                Rest alert
                <select
                  value={d.preferences.timer.alert}
                  onChange={(e) =>
                    void write("rest-alert", { value: e.target.value }, (x) => {
                      x.preferences.timer.alert = e.target.value as
                        "silent" | "short-beep";
                    })
                  }
                >
                  <option value="silent">Silent</option>
                  <option value="short-beep">One brief beep</option>
                </select>
              </label>
              <button
                onClick={() =>
                  void write("preferred-rest", {}, (x) => {
                    x.preferences.timer.preferredSeconds =
                      x.timer.selectedSeconds;
                  })
                }
              >
                Remember selected rest duration
              </button>
              <p>
                Current session data stays on this browser. Export before
                changing devices or origins.
              </p>
              <button
                onClick={() =>
                  void queue.current.then(() => download(current.current!))
                }
              >
                Export backup
              </button>
              <button onClick={() => inputFile.current?.click()}>
                Preview backup import
              </button>
              <input
                ref={inputFile}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > MAX_BYTES) {
                    setError("Backup exceeds 20 MiB");
                    return;
                  }
                  if (f)
                    void f
                      .text()
                      .then(db.parseBackup)
                      .then(setPreview)
                      .catch((e) => setError(String(e)));
                }}
              />
              {preview && (
                <section className="notice">
                  <p>
                    Preview: {preview.sessions.length} sessions. Current
                    workspace will be retained.
                  </p>
                  <button
                    onClick={() =>
                      void db
                        .restore(current.current!, preview, exported)
                        .then((next) => {
                          current.current = next;
                          setD(next);
                          setExported(-1);
                          setPreview(null);
                          setEdits({});
                          setError("");
                        })
                        .catch((e) => setError(String(e)))
                    }
                  >
                    Import reviewed backup
                  </button>
                  <button onClick={() => setPreview(null)}>
                    Cancel import
                  </button>
                </section>
              )}
              <button
                onClick={() =>
                  void db
                    .rollback(current.current!, exported)
                    .then((next) => {
                      current.current = next;
                      setD(next);
                      setEdits({});
                    })
                    .catch((e) => setError(String(e)))
                }
              >
                Restore retained M1 workspace
              </button>
              {d.legacy !== null && (
                <button
                  onClick={() =>
                    saveFile(d.legacy, "EA-original-legacy-payload.json")
                  }
                >
                  Export unchanged legacy payload
                </button>
              )}
              <p className="muted">
                M1 reconstruction · synthetic content · no deployment. Original
                legacy storage remains untouched. Old code cannot read new
                records.
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

import "./refinement.css";
