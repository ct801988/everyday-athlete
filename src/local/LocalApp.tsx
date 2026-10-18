import { useCallback, useEffect, useState, useRef } from "react";
import { RestTimer, type TimerCommand } from "./RestTimer";
import { Duration, readyTimer, startTimer, finishTimer } from "./timer";
import { store, type Snapshot } from "./store";
import { createDataset, type Dataset } from "./model";
import {
  makeBackup,
  makeLegacyBackup,
  readBackup,
  MAX_BYTES,
  rejectConflicts,
  type Backup,
} from "./backup";
import { mutate, move, coaching } from "./commands";
import { compareEffort } from "../domain/coaching";
import {
  canonicalExercise,
  canonicalConditioningExercise,
} from "../domain/fixtures";
import { DemoOverlay } from "../components/DemoOverlay";
import { SetValues, csvCell, type Mutation } from "../domain/contracts";
import { reschedule, type Slot } from "../domain/scheduling";
function download(text: string, name: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
const warning =
  "Your workouts are saved in this browser on this device. They are not automatically backed up. Clearing browser data, private browsing, losing the device, changing browsers or switching devices may lose access. Export a backup and keep it somewhere safe. Shared browser profiles are not securely separated.";
export default function LocalApp() {
  const tabId = useRef(crypto.randomUUID());
  const [unsavedDrafts, setUnsavedDrafts] = useState<Record<string, SetValues>>(
    {},
  );
  const [snap, setSnap] = useState<Snapshot | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [program, setProgram] = useState<"foundation" | "strength">("foundation"),
    [start, setStart] = useState(new Date().toISOString().slice(0, 10)),
    [days, setDays] = useState("1,3,5"),
    [pending, setPending] = useState(false),
    [preview, setPreview] = useState<Backup | null>(null),
    [importNote, setImportNote] = useState(""),
    [ack, setAck] = useState(false),
    [effort, setEffort] = useState(""),
    [date, setDate] = useState(""),
    [schedulePreview, setSchedulePreview] = useState<Slot[] | null>(null),
    [meta, setMeta] = useState("No backup exported"),
    [migrationAvailable, setMigrationAvailable] = useState(false),
    [overlay, setOverlay] = useState<{
      scroll: number;
      invoker: HTMLElement | null;
    } | null>(null),
    [update, setUpdate] = useState<ServiceWorker | null>(null);
  const close = useCallback(() => setOverlay(null), []);
  const refresh = useCallback(async () => {
    try {
      const current = await store.read();
      setSnap(current);
      const migration = await store.migrationInfo();
      setMigrationAvailable(!!migration);
      if (migration)
        setNotice(
          "Timer storage upgraded. Original data retained. Legacy paused/expired timers return Ready; initial default 2:00 and Silent. Export a new backup.",
        );
      const m = await store.meta();
      setMeta(
        m.lastExport
          ? "Last file export attempt: " +
              m.lastExport.at +
              " (retention not verified)"
          : "No backup exported",
      );
      setError("");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const on = (e: MessageEvent) => {
      if (e.data?.source === tabId.current) return;
      setNotice(
        "Another tab may have changed data. Reload device data before editing.",
      );
    };
    const ch =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("ea-local")
        : null;
    if (ch) ch.onmessage = on;
    return () => {
      ch?.close();
    };
  }, [refresh]);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let mounted = true;
    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      const check = () => {
        if (mounted) setUpdate(reg.waiting);
      };
      check();
      reg.addEventListener("updatefound", () => {
        reg.installing?.addEventListener("statechange", check);
      });
    });
    return () => {
      mounted = false;
    };
  }, []);
  const hasUnsaved = Object.entries(unsavedDrafts).some(([key, value]) => {
    const [sid, n] = key.split(":");
    const session = snap?.data.sessions.find((v) => v.id === sid);
    const saved =
      snap?.data.drafts[sid]?.[n]?.values ??
      session?.actuals.find((a) => a.ordinal === +n)?.values ??
      session?.prescription.suggested;
    return JSON.stringify(value) !== JSON.stringify(saved);
  });
  useEffect(() => {
    if (!pending && !hasUnsaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending, hasUnsaved]);
  async function act(
    action: string,
    payload: unknown,
    fn: (d: Dataset) => void,
  ) {
    if (!snap || pending) return;
    setPending(true);
    setError("");
    setNotice("Saving…");
    try {
      const next = await store.change(snap, action, payload, fn);
      setSnap(next);
      setNotice("Saved on this device — not externally backed up");
      if (typeof BroadcastChannel !== "undefined") {
        const c = new BroadcastChannel("ea-local");
        c.postMessage({ source: tabId.current });
        c.close();
      }
    } catch (e) {
      setError(
        String(e) +
          " — not saved. Edits remain visible where possible; reload after a conflict.",
      );
      setNotice("Not saved");
    } finally {
      setPending(false);
    }
  }
  const timerCommand = useCallback(
    async (c: TimerCommand): Promise<boolean> => {
      try {
        setPending(true);
        const current = await store.read();
        if (!current) return false;
        const t = current.data.view.timer;
        if (
          c.type === "finish" &&
          (t.status !== "running" || t.runId !== c.runId)
        ) {
          setSnap(current);
          return false;
        }
        if (c.type === "start" && t.status === "running") {
          setSnap(current);
          return false;
        }
        if (
          ["select", "default", "alert"].includes(c.type) &&
          t.status === "running"
        )
          return false;
        const next = await store.change(current, "timer-" + c.type, c, (x) => {
          switch (c.type) {
            case "start":
              x.view.timer = startTimer(x.view.timer, Date.now(), c.runId);
              break;
            case "reset":
              x.view.timer = readyTimer(x.view.timer.selectedSeconds);
              break;
            case "select":
              x.view.timer = readyTimer(Duration.parse(c.seconds));
              break;
            case "default":
              x.preferences.timer.preferredSeconds =
                x.view.timer.selectedSeconds;
              break;
            case "alert":
              x.preferences.timer.alert = c.alert;
              break;
            case "finish":
              x.view.timer = finishTimer(x.view.timer, c.runId, c.at);
              break;
          }
        });
        setSnap(next);
        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("ea-local");
          channel.postMessage({ source: tabId.current });
          channel.close();
        }
        return true;
      } catch (e) {
        setError(
          String(e) +
            " — timer change not saved. Reload device data if another tab changed it.",
        );
        return false;
      } finally {
        setPending(false);
      }
    },
    [],
  );
  async function command(payload: Mutation) {
    await act(payload.type, payload, (d) => mutate(d, d.view.session, payload));
  }
  async function exportData() {
    if (!snap) return;
    setError("");
    try {
      if (hasUnsaved)
        throw Error("Correct or discard unsaved entries before export");
      const backup = await makeBackup(snap.data);
      download(
        JSON.stringify(backup, null, 2),
        "everyday-athlete-" + backup.body.exportId + ".json",
      );
      await store.markExport(snap);
      setMeta(
        "Last file export attempt: " +
          backup.body.exportedAt +
          " (retention not verified)",
      );
      setNotice(
        "Backup file created. Keep it outside this browser. The app cannot verify where you saved it.",
      );
    } catch (e) {
      setError(String(e));
    }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    setPreview(null);
    setAck(false);
    setError("");
    try {
      if (file.size > MAX_BYTES) throw Error("Backup exceeds 20 MiB");
      const text = await file.text();
      const b = await readBackup(text);
      setImportNote(
        JSON.parse(text).body.dataset.schemaVersion === 1
          ? "Legacy v1 backup: timer converted to the new format. Paused/expired timers return Ready; initial default 2:00 and Silent. Original file is unchanged."
          : "Current v2 dataset; timer preferences are included. Expired runs complete visually without sound.",
      );
      if (snap) rejectConflicts(snap.data, b.body.dataset);
      setPreview(b);
    } catch (e) {
      setError("Import rejected: " + String(e) + "; current history unchanged");
    }
  }
  async function restore() {
    if (!preview || hasUnsaved) return;
    setPending(true);
    try {
      setSnap(await store.restore(preview, snap, ack));
      setUnsavedDrafts({});
      setPreview(null);
      setNotice(
        "Restore completed (or exact duplicate already present); no histories merged.",
      );
      setMeta("Export this active dataset before another restore/rollback");
    } catch (e) {
      setError(String(e));
    } finally {
      setPending(false);
    }
  }
  if (!loaded)
    return (
      <main className="local">
        <h1>Fitness App Preview</h1>
        <p role="status">Opening device storage…</p>
      </main>
    );
  const d = snap?.data,
    s = d?.sessions.find((s) => s.id === d.view.session),
    tab = d?.view.tab ?? "Backup";
  const backupUI = (
    <section aria-label="Backup and restore">
      <h2>Backup and restore</h2>
      <p>{warning}</p>
      <p>{meta}</p>
      <button
        disabled={!snap || pending || hasUnsaved}
        onClick={() => void exportData()}
      >
        Export full backup
      </button>
      {migrationAvailable && (
        <button
          disabled={pending}
          onClick={() =>
            void store
              .preMigrationData()
              .then(makeLegacyBackup)
              .then((b) =>
                download(
                  JSON.stringify(b, null, 2),
                  "everyday-athlete-pre-timer-upgrade-v1.json",
                ),
              )
              .catch((e) => setError(String(e)))
          }
        >
          Export pre-upgrade v1 backup
        </button>
      )}
      <label>
        Import JSON backup
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => void importFile(e.target.files?.[0])}
        />
      </label>
      {preview && (
        <div>
          <h3>Restore preview</h3>
          <p>{importNote}</p>
          <p>
            {preview.body.dataset.program} ·{" "}
            {preview.body.dataset.sessions.length} sessions · revision{" "}
            {preview.body.dataset.revision} · exported {preview.body.exportedAt}
          </p>
          <p>
            Origin: {preview.body.dataset.id}. This snapshot will become active;
            it will not be merged. All content is synthetic.
          </p>
          <label>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            I understand this may be another person's history and replaces my
            active workspace. I have kept my current backup safely.
          </label>
          <button
            disabled={pending || !ack || hasUnsaved}
            onClick={() => void restore()}
          >
            Confirm restore
          </button>
          <button onClick={() => setPreview(null)}>Cancel restore</button>
        </div>
      )}
      <button
        disabled={!snap || pending || hasUnsaved}
        onClick={() => {
          if (!snap) return;
          void store
            .rollback(snap)
            .then((x) => {
              setSnap(x);
              setUnsavedDrafts({});
              setNotice("Pre-restore dataset active. No data merged.");
            })
            .catch((e) => setError(String(e)));
        }}
      >
        Return to pre-restore data
      </button>
      <button
        onClick={() => {
          void navigator.storage
            ?.persist?.()
            .then((v) =>
              setNotice(
                v
                  ? "Persistent storage granted; clearing/device loss still destroys local data."
                  : "Persistence not granted; export backups regularly.",
              ),
            )
            .catch((e) => setError(String(e)));
        }}
      >
        Request persistent device storage
      </button>
    </section>
  );
  return (
    <main className="local">
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">
          F
        </span>
        <div>
          <span className="eyebrow">OWNER PREVIEW · LOCAL FIRST</span>
          <h1>Fitness App Preview</h1>
        </div>
      </header>
      <p className="warning">
        Synthetic software preview — not approved training guidance. Fit content
        pending review.
      </p>
      <p role="status" aria-live="polite">
        {notice}
      </p>
      {(error || hasUnsaved) && (
        <p role="alert">
          {error}{" "}
          {hasUnsaved
            ? "Some entered values are not saved. Correct them in Workout or explicitly reload to discard them."
            : ""}
        </p>
      )}

      {update && (
        <button
          disabled={pending || hasUnsaved}
          onClick={() => {
            update.postMessage("ACTIVATE");
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => location.reload(),
              { once: true },
            );
          }}
        >
          Apply cached app update (saved work retained)
        </button>
      )}
      {!d || !s ? (
        <>
          <h2>Choose a demonstration program</h2>
          <p>No registration or cloud connection required.</p>
          <p>{warning}</p>
          <label>
            Program
            <select
              aria-label="Program"
              value={program}
              onChange={(e) => {
                const p = e.target.value as typeof program;
                setProgram(p);
                setDays(p === "foundation" ? "1,3,5" : "1,2,4,6");
              }}
            >
              <option value="foundation">
                Everyday Foundation · 3 days/week · synthetic
              </option>
              <option value="strength">
                Everyday Strength · 4 days/week · synthetic
              </option>
              <option disabled>Everyday Fit · pending review</option>
            </select>
          </label>
          <label>
            Start date
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Preferred weekdays (0 Sun–6 Sat, comma separated)
            <input value={days} onChange={(e) => setDays(e.target.value)} />
          </label>
          <button
            disabled={pending}
            onClick={() => {
              setPending(true);
              void Promise.resolve()
                .then(() =>
                  store.create(
                    createDataset(program, start, days.split(",").map(Number)),
                  ),
                )
                .then((x) => {
                  setSnap(x);
                  setNotice("Setup saved on this device");
                })
                .catch((e) => setError(String(e)))
                .finally(() => setPending(false));
            }}
          >
            Start synthetic demonstration
          </button>
          {backupUI}
        </>
      ) : (
        <>
          <nav aria-label="Main">
            {(["Workout", "Schedule", "History", "Backup"] as const).map(
              (t) => (
                <button
                  aria-pressed={tab === t}
                  key={t}
                  disabled={pending}
                  onClick={() =>
                    void act("view", { tab: t }, (x) => {
                      x.view.tab = t;
                    })
                  }
                >
                  {t}
                </button>
              ),
            )}
          </nav>
          {tab === "Workout" && (
            <>
              <section className="workout-hero">
                <span className="eyebrow">YOUR WORKOUT · SYNTHETIC</span>
                <h2>
                  {d.program === "foundation"
                    ? "Everyday Foundation"
                    : "Everyday Strength"}{" "}
                </h2>
                <p>
                  Flexible schedule · {d.program === "foundation" ? "3" : "4"}{" "}
                  training days / week
                </p>
                <div className="session-progress">
                  <span>
                    {s.actuals.filter((a) => a.confirmed).length} of{" "}
                    {s.prescription.setCount} sets logged
                  </span>
                  <progress
                    aria-label="Sets logged"
                    max={s.prescription.setCount}
                    value={s.actuals.filter((a) => a.confirmed).length}
                  />
                </div>
              </section>
              <label>
                Session
                <select
                  aria-label="Session"
                  value={s.id}
                  disabled={pending}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEffort("");
                    void act("select-session", value, (x) => {
                      x.view.session = value;
                    });
                  }}
                >
                  {d.sessions.map((x, i) => (
                    <option key={x.id} value={x.id}>
                      {x.prescription.modality === "conditioning"
                        ? "Synthetic conditioning"
                        : `Session ${i + 1}`}{" "}
                      · {x.status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="exercise-intro">
                <span className="eyebrow">EXERCISE 01 · DEMONSTRATION</span>
                <h3>
                  {s.prescription.modality === "strength"
                    ? "Dumbbell press"
                    : "Conditioning example"}
                </h3>
                <p>
                  Prescribed: {s.prescription.setCount} sets ·{" "}
                  {s.prescription.modality === "strength"
                    ? "synthetic dumbbell press"
                    : "synthetic walk"}
                  . Suggestions are not performed records.
                </p>
                <button
                  onClick={(e) =>
                    setOverlay({
                      scroll: window.scrollY,
                      invoker: e.currentTarget,
                    })
                  }
                >
                  Exercise demonstration
                </button>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={d.preferences.rir}
                  disabled={pending}
                  onChange={(e) => {
                    const value = e.target.checked;
                    void act("rir-preference", value, (x) => {
                      x.preferences.rir = value;
                    });
                  }}
                />
                Advanced: optional per-set RIR
              </label>
              {Array.from({ length: s.prescription.setCount }, (_, i) => {
                const ordinal = i + 1,
                  a = s.actuals.find((a) => a.ordinal === ordinal),
                  values =
                    unsavedDrafts[s.id + ":" + ordinal] ??
                    d.drafts[s.id]?.[ordinal]?.values ??
                    a?.values ??
                    s.prescription.suggested;
                const edit = (v: SetValues) => {
                  const key = s.id + ":" + ordinal;
                  setUnsavedDrafts((old) => ({ ...old, [key]: v }));
                  void act(
                    "draft",
                    { session: s.id, ordinal, values: v },
                    (x) => {
                      x.drafts[s.id] ??= {};
                      x.drafts[s.id][ordinal] = { values: SetValues.parse(v) };
                    },
                  );
                };
                const row = {
                  id: a?.id ?? crypto.randomUUID(),
                  ordinal,
                  expectedRevision: a?.revision ?? 0,
                  confirmed: true,
                  values,
                };
                return (
                  <section
                    className={`set-card ${a?.confirmed ? "set-done" : ""}`}
                    key={ordinal}
                    aria-label={`Set ${ordinal}`}
                  >
                    <h3>
                      Set {ordinal} · {a?.confirmed ? "Done" : "Not performed"}
                    </h3>
                    <div className="set">
                      {values.load.kind === "external" && (
                        <label>
                          Weight ({values.load.unit})
                          <span className="basis">
                            {values.load.basis.replaceAll("_", " ")}
                          </span>
                          <input
                            aria-label={`Weight set ${ordinal}`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={values.load.value}
                            disabled={pending || s.status !== "active"}
                            onChange={(e) =>
                              edit({
                                ...values,
                                load: {
                                  ...(values.load as Extract<
                                    SetValues["load"],
                                    { kind: "external" }
                                  >),
                                  value: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </label>
                      )}
                      <label>
                        {values.seconds !== null ? "Seconds" : "Reps"}
                        <input
                          aria-label={`Reps or seconds set ${ordinal}`}
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={values.seconds ?? values.reps ?? ""}
                          disabled={pending || s.status !== "active"}
                          onChange={(e) =>
                            edit({
                              ...values,
                              ...(values.seconds !== null
                                ? { seconds: Number(e.target.value) }
                                : { reps: Number(e.target.value) }),
                            })
                          }
                        />
                      </label>
                      {d.preferences.rir && (
                        <label>
                          RIR (blank unknown; 5+)
                          <select
                            aria-label={`RIR set ${ordinal}`}
                            value={
                              values.rir === null
                                ? ""
                                : values.rirCapped
                                  ? "5+"
                                  : String(values.rir)
                            }
                            disabled={pending}
                            onChange={(e) =>
                              edit({
                                ...values,
                                rir:
                                  e.target.value === ""
                                    ? null
                                    : e.target.value === "5+"
                                      ? 5
                                      : Number(e.target.value),
                                rirCapped: e.target.value === "5+",
                              })
                            }
                          >
                            <option value="">Unknown</option>
                            {["0", "1", "2", "3", "4", "5", "5+"].map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                    <button
                      className="primary done-control"
                      disabled={pending || s.status !== "active"}
                      onClick={() =>
                        void command({ type: "sets", items: [row] })
                      }
                    >
                      {a?.confirmed ? "Save correction" : "Done"}
                    </button>
                    <button
                      disabled={
                        pending || !a?.confirmed || s.status !== "active"
                      }
                      onClick={() =>
                        void command({
                          type: "sets",
                          items: [{ ...row, confirmed: false }],
                        })
                      }
                    >
                      Undo set {ordinal}
                    </button>
                  </section>
                );
              })}
              <Bulk
                session={s}
                dataset={d}
                disabled={pending || s.status !== "active"}
                confirm={(m) => void command(m)}
              />
              <button
                disabled={pending}
                onClick={() =>
                  void command({
                    type: "finish",
                    expectedRevision: s.revision,
                    status: "partial",
                  })
                }
              >
                Finish partial workout
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  void command({
                    type: "finish",
                    expectedRevision: s.revision,
                    status: "completed",
                  })
                }
              >
                Finish complete workout
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  void command({ type: "reopen", expectedRevision: s.revision })
                }
              >
                Reopen workout
              </button>
              {s.prescription.modality === "conditioning" && (
                <section>
                  <h3>Conditioning effort · synthetic</h3>
                  <p>
                    Recommended Effort Level: {s.prescription.effortTarget?.min}
                    –{s.prescription.effortTarget?.max}/10 ·{" "}
                    {s.prescription.effortTarget?.descriptor}
                  </p>
                  <p>{s.prescription.effortTarget?.feel}</p>
                  <details>
                    <summary>About Effort Level</summary>
                    <p>
                      Easy to hard on a 1–10 scale. These illustrative anchors
                      need qualified review. Higher effort is not inherently
                      better. Your report is optional and separate from the
                      target.
                    </p>
                  </details>
                  <label>
                    Your Effort Level (optional)
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={effort}
                      onChange={(e) => setEffort(e.target.value)}
                    />
                  </label>
                  <p>Saved actual: {s.effort?.value ?? "Unknown"}</p>
                  <button
                    disabled={pending}
                    onClick={() =>
                      void command({
                        type: "effort",
                        expectedRevision: s.effortRevision,
                        report: {
                          value: effort === "" ? null : Number(effort),
                          scale: "synthetic-effort",
                          scaleVersion: 1,
                        },
                      })
                    }
                  >
                    Save optional effort
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => {
                      setEffort("");
                      void command({
                        type: "effort",
                        expectedRevision: s.effortRevision,
                        report: {
                          value: null,
                          scale: "synthetic-effort",
                          scaleVersion: 1,
                        },
                      });
                    }}
                  >
                    Skip or clear effort
                  </button>
                  <p>
                    {JSON.stringify(
                      compareEffort(s.prescription.effortTarget, s.effort),
                    )}
                  </p>
                </section>
              )}
              <section>
                <h3>Why this? · synthetic rules, not reviewed guidance</h3>
                <label>
                  <input
                    type="checkbox"
                    checked={s.context.pain}
                    disabled={pending}
                    onChange={(e) => {
                      const value = e.target.checked;
                      void act("pain-context", value, (x) => {
                        x.sessions.find((v) => v.id === s.id)!.context.pain =
                          value;
                      });
                    }}
                  />
                  Pain context (do not continue affected work)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={s.context.tired}
                    disabled={pending}
                    onChange={(e) => {
                      const value = e.target.checked;
                      void act("tired-context", value, (x) => {
                        x.sessions.find((v) => v.id === s.id)!.context.tired =
                          value;
                      });
                    }}
                  />
                  Tired context
                </label>
                <button
                  disabled={pending}
                  onClick={() =>
                    void act("coaching", s.context, (x) => {
                      x.recommendations.push(
                        coaching(x, s.id, s.context.pain, s.context.tired),
                      );
                    })
                  }
                >
                  Explain recommendation
                </button>
                <pre>
                  {d.recommendations.filter((q) => q.session === s.id).at(-1)
                    ?.output ?? "No recommendation calculated"}
                </pre>
              </section>
            </>
          )}
          {tab === "Schedule" && (
            <section>
              <h2>Schedule · {d.program === "foundation" ? 3 : 4} days/week</h2>
              <p>
                Missed sessions remain in order. Minimum gap is a synthetic test
                parameter, not reviewed recovery guidance.
              </p>
              <ol>
                {d.slots.map((slot) => (
                  <li key={slot.id}>
                    {slot.id}: {slot.plannedDate} ({slot.status}) · originally{" "}
                    {slot.originalDate}
                  </li>
                ))}
              </ol>
              <label>
                Move next pending session to
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSchedulePreview(null);
                  }}
                />
              </label>
              <button
                onClick={() => {
                  try {
                    const slot = d.slots.find((s) => s.status === "pending");
                    if (!slot) throw Error("No pending slot");
                    setSchedulePreview(
                      reschedule(
                        d.slots,
                        slot.id,
                        date,
                        1,
                        slot.revision,
                        d.weekdays,
                      ),
                    );
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              >
                Preview reschedule
              </button>
              {schedulePreview && (
                <div>
                  <pre>
                    {schedulePreview
                      .map((x) => x.id + ": " + x.plannedDate)
                      .join("\n")}
                  </pre>
                  <button
                    disabled={pending}
                    onClick={() => {
                      void act("reschedule", date, (x) =>
                        move(
                          x,
                          x.slots.find((s) => s.status === "pending")!.id,
                          date,
                        ),
                      );
                      setSchedulePreview(null);
                    }}
                  >
                    Confirm reschedule
                  </button>
                  <button onClick={() => setSchedulePreview(null)}>
                    Cancel reschedule
                  </button>
                </div>
              )}
            </section>
          )}
          {tab === "History" && (
            <section>
              <h2>History and progress</h2>
              <p>
                {d.sessions.filter((s) => s.status === "completed").length}{" "}
                completed;{" "}
                {d.sessions.filter((s) => s.status === "partial").length}{" "}
                partial. Checkmarks alone are not evidence of safe form.
              </p>
              {d.sessions.map((s) => (
                <article key={s.id}>
                  <h3>
                    {s.slot ?? "Conditioning demonstration"} · {s.status}
                  </h3>
                  <p>
                    Performed date: {s.performedDate ?? "Not completed"} ·
                    actual sets: {s.actuals.filter((a) => a.confirmed).length}
                  </p>
                  <pre>{JSON.stringify(s.actuals, null, 2)}</pre>
                </article>
              ))}
              <p>
                {d.audit.length} retained audit events; revision {d.revision}
              </p>
              <button
                onClick={() =>
                  download(
                    "session,status,actuals\n" +
                      d.sessions
                        .map((s) =>
                          [s.id, s.status, s.actuals].map(csvCell).join(","),
                        )
                        .join("\n"),
                    "everyday-athlete-report.csv",
                    "text/csv",
                  )
                }
              >
                Export CSV report (not a backup)
              </button>
            </section>
          )}
          {tab === "Backup" && backupUI}
        </>
      )}
      <details className="device-tools">
        <summary>Device data &amp; recovery tools</summary>
        <button
          onClick={() => {
            setUnsavedDrafts({});
            void refresh();
          }}
        >
          Reload device data (discards unsaved edits)
        </button>
      </details>
      {overlay && (
        <DemoOverlay
          {...overlay}
          exercise={
            s?.prescription.modality === "conditioning"
              ? canonicalConditioningExercise
              : canonicalExercise
          }
          close={close}
        />
      )}
      {d && <RestTimer key={snap?.key} data={d} command={timerCommand} />}
    </main>
  );
}
import type { LocalSession } from "./model";
function Bulk({
  session: s,
  dataset: d,
  disabled,
  confirm,
}: {
  session: LocalSession;
  dataset: Dataset;
  disabled: boolean;
  confirm: (m: Mutation) => void;
}) {
  const [preview, setPreview] = useState<Mutation | null>(null);
  return (
    <section>
      <button
        disabled={disabled}
        onClick={() => {
          const items = Array.from(
            { length: s.prescription.setCount },
            (_, i) => i + 1,
          )
            .filter((n) => !s.actuals.find((a) => a.ordinal === n)?.confirmed)
            .map((ordinal) => {
              const a = s.actuals.find((a) => a.ordinal === ordinal);
              return {
                id: a?.id ?? crypto.randomUUID(),
                ordinal,
                expectedRevision: a?.revision ?? 0,
                confirmed: true,
                values:
                  d.drafts[s.id]?.[ordinal]?.values ??
                  a?.values ??
                  s.prescription.suggested,
              };
            });
          if (items.length) setPreview({ type: "sets", items });
        }}
      >
        Review remaining sets
      </button>
      {preview && (
        <>
          <pre>{JSON.stringify(preview, null, 2)}</pre>
          <button
            disabled={disabled}
            onClick={() => {
              confirm(preview);
              setPreview(null);
            }}
          >
            Confirm these performed values
          </button>
          <button onClick={() => setPreview(null)}>Cancel bulk</button>
        </>
      )}
    </section>
  );
}
