import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActualSet,
  Session,
  MutationEnvelope,
  Mutation,
} from "./domain/contracts";
import { SetValues as ValidateValues } from "./domain/contracts";
import {
  api,
  loadDevice,
  saveDevice,
  initialDevice,
  type DeviceState,
} from "./data/client";
import { DemoOverlay } from "./components/DemoOverlay";
import { compareEffort } from "./domain/coaching";
import { Programs } from "./domain/contracts";
import { reschedule, type Slot } from "./domain/scheduling";
function message(e: unknown) {
  return e instanceof Error ? e.message : "Operation failed";
}
export default function App() {
  const [conditioning, setConditioning] = useState<Session | null>(null);
  const [identity, setIdentity] = useState<{
      id: string;
      sessionId: string;
    } | null>(null),
    [device, setDevice] = useState<DeviceState | null>(null),
    [session, setSession] = useState<Session | null>(null),
    [tab, setTab] = useState("Workout"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("Sign in to the synthetic SQL lab."),
    [offline, setOffline] = useState(!navigator.onLine),
    [busy, setBusy] = useState(false),
    [conflict, setConflict] = useState(false),
    [username, setUsername] = useState("alice"),
    [password, setPassword] = useState("alice-local-only"),
    [bulk, setBulk] = useState(false),
    [effort, setEffort] = useState(""),
    [help, setHelp] = useState(false),
    [now, setNow] = useState(Date.now());
  const ref = useRef<DeviceState | null>(null),
    writes = useRef<Promise<void>>(Promise.resolve());
  const [overlay, setOverlay] = useState<{
    scroll: number;
    invoker: HTMLElement | null;
  } | null>(null);
  const closeOverlay = useCallback(() => setOverlay(null), []);
  const [schedulePreview, setSchedulePreview] = useState<Slot[] | null>(null);
  const [scheduleData, setScheduleData] = useState<{
      revision: number;
      data: Slot[];
    }>({ revision: 0, data: [] }),
    [program, setProgram] = useState("foundation"),
    [start, setStart] = useState("2026-10-21"),
    [weekdays, setWeekdays] = useState("1,3,5"),
    [movedate, setMoveDate] = useState("2026-10-23");
  function showDevice(d: DeviceState) {
    ref.current = d;
    setDevice(d);
  }
  async function persist(d: DeviceState) {
    showDevice(d);
    setNotice("Saving device draft…");
    const task = writes.current.catch(() => {}).then(() => saveDevice(d));
    writes.current = task;
    try {
      await task;
      setNotice(
        d.pending.length
          ? "Saved on this device; waiting to sync."
          : "Device draft saved.",
      );
      return true;
    } catch (e) {
      setError(message(e) + " — changes are not saved on this device.");
      setNotice("Not saved on this device.");
      return false;
    }
  }
  async function activate(me: { id: string; sessionId: string }) {
    const s = await api<Session>("session?id=" + me.sessionId);
    const cached = await loadDevice(me.id);
    let d =
      cached && cached.sessionId === s.id ? cached : initialDevice(me.id, s);
    d = { ...d, snapshot: s };
    setIdentity(me);
    setSession(s);
    showDevice(d);
    localStorage.setItem("ea-last-user", me.id);
    const c = await api<Session>("conditioning");
    setConditioning(c);
    setEffort(c.effort?.value?.toString() ?? "");
    await persist(d);
    setNotice(
      d.pending.length
        ? "Device changes waiting for explicit sync."
        : "Saved to account.",
    );
  }
  useEffect(() => {
    void api<{ id: string; sessionId: string }>("me")
      .then(activate)
      .catch(async () => {
        const user = localStorage.getItem("ea-last-user");
        if (!navigator.onLine && user) {
          const d = await loadDevice(user);
          if (d) {
            showDevice(d);
            setSession(d.snapshot);
            setNotice(
              "Offline device draft. Sign in when connected before account sync.",
            );
          }
        }
      });
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    const on = () => {
        setOffline(false);
      },
      off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      clearInterval(tick);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  function effective() {
    const result = new Map<number, ActualSet>(
      (session?.actuals || []).map((a) => [a.ordinal, a]),
    );
    for (const m of device?.pending || []) {
      if (m.sessionId === device?.sessionId && m.payload.type === "sets")
        for (const item of m.payload.items)
          result.set(item.ordinal, {
            ...item,
            session_id: m.sessionId,
            revision: item.expectedRevision + 1,
          });
    }
    return result;
  }
  const actuals = effective();
  const count = [...actuals.values()].filter((a) => a.confirmed).length;
  async function sync() {
    const d = ref.current;
    if (!d || busy) return;
    setBusy(true);
    setError("");
    try {
      const me = await api<{ id: string }>("me");
      if (me.id !== d.userId)
        throw Error(
          "Account mismatch: original user must sign in before syncing this draft",
        );
      let current = d;
      while (current.pending.length) {
        await api("mutate", current.pending[0]);
        const s = await api<Session>("session?id=" + current.sessionId);
        current = {
          ...ref.current!,
          pending: ref.current!.pending.filter(
            (m) => m.id !== current.pending[0].id,
          ),
          snapshot: s,
        };
        setSession(s);
        await persist(current);
      }
      setConditioning(await api<Session>("conditioning"));
      setConflict(false);
      setNotice("Saved to account.");
    } catch (e) {
      setError(message(e));
      setConflict(/conflict|mismatch/i.test(message(e)));
      setNotice("Device changes retained; not saved to account.");
    } finally {
      setBusy(false);
    }
  }
  async function enqueue(payload: Mutation, targetSession?: string) {
    if (!ref.current) return;
    const m: MutationEnvelope = {
      id: crypto.randomUUID(),
      sessionId: targetSession ?? ref.current.sessionId,
      payload,
    };
    setError("");
    await persist({ ...ref.current, pending: [...ref.current.pending, m] });
  }
  async function confirm(ordinal: number, undo = false) {
    const d = ref.current;
    if (!d) return;
    const row = d.drafts[ordinal];
    try {
      const values = ValidateValues.parse(row.values);
      await enqueue({
        type: "sets",
        items: [
          {
            id: row.id,
            ordinal,
            expectedRevision: actuals.get(ordinal)?.revision ?? 0,
            confirmed: !undo,
            values,
          },
        ],
      });
    } catch (e) {
      setError(message(e));
    }
  }
  function update(
    ordinal: number,
    part: "weight" | "reps" | "rir",
    value: string,
  ) {
    const d = ref.current;
    if (!d) return;
    const row = d.drafts[ordinal],
      values = structuredClone(row.values);
    if (part === "weight" && "value" in values.load)
      values.load.value = value === "" ? NaN : Number(value);
    if (part === "reps") values.reps = value === "" ? null : Number(value);
    if (part === "rir") {
      values.rir = value === "" ? null : value === "5+" ? 5 : Number(value);
      values.rirCapped = value === "5+";
    }
    void persist({
      ...d,
      drafts: { ...d.drafts, [ordinal]: { ...row, values, edited: true } },
    });
  }
  async function resolveConflict(keep: boolean) {
    const d = ref.current;
    if (!d || !identity) return;
    try {
      const first = d.pending[0];
      const s = await api<Session>(
        "session?id=" + (first?.sessionId ?? d.sessionId),
      );
      const main =
        s.id === d.sessionId
          ? s
          : await api<Session>("session?id=" + d.sessionId);
      let pending = d.pending.slice(1);
      if (keep && first) {
        let payload = first.payload;
        if (payload.type === "sets")
          payload = {
            ...payload,
            items: payload.items.map((it) => ({
              ...it,
              expectedRevision:
                s.actuals.find((a) => a.id === it.id)?.revision ?? 0,
            })),
          };
        if (payload.type === "effort")
          payload = { ...payload, expectedRevision: s.effortRevision };
        if (payload.type === "finish" || payload.type === "reopen")
          payload = { ...payload, expectedRevision: s.revision };
        pending = [{ ...first, id: crypto.randomUUID(), payload }, ...pending];
      }
      let drafts = d.drafts;
      if (!keep && first?.payload.type === "sets" && s.id === d.sessionId) {
        drafts = { ...drafts };
        for (const it of first.payload.items) {
          const account = s.actuals.find((a) => a.id === it.id);
          if (account)
            drafts[it.ordinal] = {
              ...drafts[it.ordinal],
              values: account.values,
              edited: false,
            };
        }
      }
      if (s.prescription.modality === "conditioning") {
        setConditioning(s);
        if (!keep) setEffort(s.effort?.value?.toString() ?? "");
      }
      setSession(main);
      await persist({ ...d, drafts, pending, snapshot: main });
      setConflict(false);
      setNotice(
        keep
          ? "Device edit rebased explicitly; sync to submit."
          : "Account version kept; pending conflict discarded.",
      );
    } catch (e) {
      setError(message(e));
    }
  }
  async function finish(status: "partial" | "completed") {
    if (device?.pending.length) {
      setError("Sync pending changes before finishing.");
      return;
    }
    if (session)
      await enqueue({
        type: "finish",
        expectedRevision: session.revision,
        status,
      });
  }
  async function saveEffort(skip = false) {
    if (!conditioning) return;
    await enqueue(
      {
        type: "effort",
        expectedRevision: conditioning.effortRevision,
        report: {
          value: skip || effort === "" ? null : Number(effort),
          scale: "synthetic-effort",
          scaleVersion: 1,
        },
      },
      conditioning.id,
    );
  }
  async function openDemo(e: React.MouseEvent<HTMLButtonElement>) {
    const invoker = e.currentTarget;
    await writes.current.catch(() => {});
    setOverlay({ scroll: window.scrollY, invoker });
  }
  async function readSchedule() {
    try {
      setScheduleData(await api("schedule"));
    } catch (e) {
      setError(message(e));
    }
  }
  async function createSchedule() {
    try {
      const days = program === "foundation" ? 3 : 4;
      await api("schedule", {
        expectedRevision: scheduleData.revision,
        request: {
          start,
          weekdays: weekdays.split(",").map(Number),
          days,
          count: 8,
          minimumGapDays: 1,
          timezone: "America/Chicago",
        },
      });
      await readSchedule();
    } catch (e) {
      setError(message(e));
    }
  }
  async function moveFirst() {
    try {
      const slot = scheduleData.data.find((s) => s.status === "pending");
      if (!slot) throw Error("No pending schedule");
      await api("reschedule", {
        id: slot.id,
        date: movedate,
        expectedRevision: scheduleData.revision,
        slotRevision: slot.revision,
        minimumGapDays: 1,
      });
      await readSchedule();
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <>
      <header className="top">
        <div>
          <span className="eyebrow">ASSIGNMENT 002 / DEVELOPMENT ONLY</span>
          <h1>
            Everyday Athlete <span>Foundation Lab</span>
          </h1>
        </div>
        <span className="pill">Synthetic data · Local only</span>
      </header>
      <main>
        <section className="warning">
          Not a reviewed training program. PostgreSQL WASM SQL lab; native
          Supabase Auth/Storage verification is blocked. Do not enter real
          personal data.
        </section>
        {!identity && (
          <section className="panel">
            <h2>Synthetic account sign-in</h2>
            <p>
              Two local-only test accounts: alice / alice-local-only, bob /
              bob-local-only. These credentials are intentionally public
              fixtures.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void api<{ id: string; sessionId: string }>("login", {
                  username,
                  password,
                })
                  .then(activate)
                  .catch((e) => setError(message(e)));
              }}
            >
              <label>
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <button type="submit">Sign in</button>
            </form>
          </section>
        )}
        <div role="status" aria-live="polite" className="status">
          {offline ? "Offline · " : ""}
          {notice} {device && `${device.pending.length} queued mutation(s)`}
        </div>
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {identity && (
          <div className="account">
            <span>
              Signed in: {identity.id.startsWith("111") ? "Alice" : "Bob"} ·
              separate synthetic records
            </span>
            <button
              onClick={() => {
                void api("logout", {}).then(() => {
                  setIdentity(null);
                  setSession(null);
                  ref.current = null;
                  setDevice(null);
                  setNotice(
                    "Signed out. Unsynced drafts remain scoped to their original user.",
                  );
                });
              }}
            >
              Sign out
            </button>
          </div>
        )}
        {device && session && (
          <>
            <nav aria-label="Lab sections">
              {["Workout", "Schedule", "History"].map((t) => (
                <button
                  key={t}
                  aria-current={t === tab ? "page" : undefined}
                  onClick={() => {
                    setTab(t);
                    if (t === "Schedule") void readSchedule();
                  }}
                >
                  {t}
                </button>
              ))}
            </nav>
            {tab === "Workout" && (
              <>
                <section className="panel">
                  <div className="section-title">
                    <div>
                      <span className="eyebrow">
                        EXERCISE 1 OF 1 · SYNTHETIC FIXTURE
                      </span>
                      <h2>Synthetic dumbbell press</h2>
                    </div>
                    <button onClick={openDemo}>View demonstration</button>
                  </div>
                  <p>
                    3 sets · 8–12 reps · Weight is{" "}
                    <strong>lb per dumbbell</strong>
                  </p>
                  <div className="goal">
                    <span>Suggested target</span>
                    <strong>
                      {"value" in session.prescription.suggested.load
                        ? session.prescription.suggested.load.value
                        : "BW"}{" "}
                      {"unit" in session.prescription.suggested.load
                        ? session.prescription.suggested.load.unit
                        : ""}{" "}
                      each × {session.prescription.suggested.reps} reps
                    </strong>
                    <p>
                      Illustrative baseline fixture. Suggestions stay drafts
                      until you deliberately tap Done after performing the set.
                    </p>
                  </div>
                  <p data-testid="completion-count">
                    <strong>{count} of 3</strong> sets confirmed
                  </p>
                  {[1, 2, 3].map((n) => {
                    const row = device.drafts[n],
                      a = actuals.get(n);
                    return (
                      <article
                        className="set"
                        key={row.id}
                        aria-label={"Set " + n}
                      >
                        <strong>Set {n}</strong>
                        <label>
                          Weight (lb each)
                          <input
                            aria-label={"Set " + n + " weight"}
                            inputMode="decimal"
                            value={
                              "value" in row.values.load &&
                              Number.isFinite(row.values.load.value)
                                ? row.values.load.value
                                : ""
                            }
                            onChange={(e) =>
                              update(n, "weight", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Reps
                          <input
                            aria-label={"Set " + n + " reps"}
                            inputMode="numeric"
                            value={row.values.reps ?? ""}
                            onChange={(e) => update(n, "reps", e.target.value)}
                          />
                        </label>
                        {device.trackRir && (
                          <label>
                            RIR (optional)
                            <select
                              aria-label={"Set " + n + " RIR"}
                              value={
                                row.values.rirCapped
                                  ? "5+"
                                  : (row.values.rir ?? "")
                              }
                              onChange={(e) => update(n, "rir", e.target.value)}
                            >
                              <option value="">Unknown</option>
                              {[0, 1, 2, 3, 4, 5].map((v) => (
                                <option key={v} value={v === 5 ? "5+" : v}>
                                  {v === 5 ? "5+" : v}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        <div className="set-actions">
                          <button
                            disabled={busy || session.status !== "active"}
                            onClick={() => {
                              void confirm(n);
                            }}
                          >
                            {a?.confirmed ? "Save correction" : "Done"}
                          </button>
                          {a?.confirmed && (
                            <button
                              onClick={() => {
                                void confirm(n, true);
                              }}
                              disabled={busy}
                            >
                              Undo set {n}
                            </button>
                          )}
                        </div>
                        <small>
                          {a?.confirmed
                            ? "Confirmed actual; edits require Save correction."
                            : "Suggested / edited draft — not performed."}
                        </small>
                      </article>
                    );
                  })}
                  <button
                    className="secondary"
                    disabled={
                      count === 3 ||
                      session.status !== "active" ||
                      device.pending.length > 0
                    }
                    onClick={() => setBulk(true)}
                  >
                    Mark remaining sets complete
                  </button>
                  {bulk && (
                    <section
                      className="bulk"
                      role="region"
                      aria-label="Bulk confirmation"
                    >
                      <h3>Review remaining performed sets</h3>
                      {[1, 2, 3]
                        .filter((n) => !actuals.get(n)?.confirmed)
                        .map((n) => (
                          <p key={n}>
                            Set {n}:{" "}
                            {"value" in device.drafts[n].values.load
                              ? device.drafts[n].values.load.value
                              : "BW"}{" "}
                            lb each × {device.drafts[n].values.reps} reps
                          </p>
                        ))}
                      <button
                        onClick={() => {
                          try {
                            const items = [1, 2, 3]
                              .filter((n) => !actuals.get(n)?.confirmed)
                              .map((n) => ({
                                id: device.drafts[n].id,
                                ordinal: n,
                                expectedRevision: actuals.get(n)?.revision ?? 0,
                                confirmed: true,
                                values: ValidateValues.parse(
                                  device.drafts[n].values,
                                ),
                              }));
                            void enqueue({ type: "sets", items });
                            setBulk(false);
                          } catch (e) {
                            setError(message(e));
                          }
                        }}
                      >
                        I performed these remaining sets
                      </button>
                      <button onClick={() => setBulk(false)}>
                        Cancel bulk
                      </button>
                    </section>
                  )}
                </section>
                <section className="panel">
                  <h2>Rest timer</h2>
                  <p className="timer" data-testid="timer">
                    {device.timer.deadline
                      ? Math.max(
                          0,
                          Math.ceil((device.timer.deadline - now) / 1000),
                        )
                      : device.timer.paused || 0}
                    s
                  </p>
                  <div className="actions">
                    <button
                      onClick={() => {
                        void persist({
                          ...device,
                          timer: {
                            deadline:
                              Date.now() + (device.timer.paused || 120) * 1000,
                            paused: 0,
                          },
                        });
                      }}
                    >
                      Start / resume rest
                    </button>
                    <button
                      onClick={() => {
                        void persist({
                          ...device,
                          timer: {
                            deadline: null,
                            paused: device.timer.deadline
                              ? Math.max(
                                  0,
                                  Math.ceil(
                                    (device.timer.deadline - Date.now()) / 1000,
                                  ),
                                )
                              : 0,
                          },
                        });
                      }}
                    >
                      Pause rest
                    </button>
                  </div>
                  <p>
                    Clock-based deadline, saved with device draft. No background
                    alarm guarantee.
                  </p>
                </section>
                <section className="panel">
                  <h2>Advanced tracking</h2>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={device.trackRir}
                      onChange={(e) => {
                        void persist({ ...device, trackRir: e.target.checked });
                      }}
                    />{" "}
                    Track RIR (optional, default OFF)
                  </label>
                  <p>
                    Blank RIR stays unknown. It is not required for eligible
                    progression.
                  </p>
                </section>
                <section className="panel">
                  <h2>Conditioning contract fixture</h2>
                  <p>
                    Not this strength exercise's effort field. Separate
                    synthetic post-session report form for data-contract
                    inspection.
                  </p>
                  <p data-testid="effort-target">
                    <strong>Recommended Effort Level:</strong>{" "}
                    {conditioning?.prescription.effortTarget
                      ? `${conditioning.prescription.effortTarget.min}${conditioning.prescription.effortTarget.max === conditioning.prescription.effortTarget.min ? "" : "–" + conditioning.prescription.effortTarget.max} / 10 — ${conditioning.prescription.effortTarget.descriptor}`
                      : "Guidance unavailable"}
                  </p>
                  <p>
                    {conditioning?.prescription.effortTarget?.feel ??
                      "No target or feel cue is inferred."}
                  </p>
                  <button
                    onClick={() => setHelp((x) => !x)}
                    aria-expanded={help}
                  >
                    Explain Effort Level
                  </button>
                  {help && (
                    <div className="help">
                      <p>
                        Concept: how hard the session felt overall, from very
                        easy to the hardest effort you can describe. Exact
                        anchors need qualified review. This is not a target to
                        chase.
                      </p>
                      <button onClick={() => setHelp(false)}>
                        Close effort guide
                      </button>
                    </div>
                  )}
                  <label>
                    Your Effort Level (optional)
                    <select
                      value={effort}
                      onChange={(e) => setEffort(e.target.value)}
                    >
                      <option value="">Not reported</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </label>
                  <div className="actions">
                    <button
                      disabled={device.pending.length > 0}
                      onClick={() => {
                        void saveEffort();
                      }}
                    >
                      Save effort report
                    </button>
                    <button
                      disabled={device.pending.length > 0}
                      onClick={() => {
                        setEffort("");
                        void saveEffort(true);
                      }}
                    >
                      Skip / clear effort
                    </button>
                  </div>
                  <p>
                    Your Effort Level recorded:{" "}
                    {conditioning?.effort?.value ?? "Not reported"}
                  </p>
                  <p>
                    {
                      compareEffort(
                        conditioning?.prescription.effortTarget ?? null,
                        conditioning?.effort ?? null,
                      ).reason
                    }
                  </p>
                </section>
                <section className="panel">
                  <h2>Save and finish</h2>
                  <div className="actions">
                    <button
                      disabled={busy || !device.pending.length}
                      onClick={() => {
                        void sync();
                      }}
                    >
                      Sync to account
                    </button>
                    <button
                      disabled={
                        device.pending.length > 0 || session.status !== "active"
                      }
                      onClick={() => {
                        void finish(count === 3 ? "completed" : "partial");
                      }}
                    >
                      Finish {count === 3 ? "completed" : "partial"} session
                    </button>
                    {session.status !== "active" && (
                      <button
                        onClick={() => {
                          void enqueue({
                            type: "reopen",
                            expectedRevision: session.revision,
                          });
                        }}
                      >
                        Reopen for correction
                      </button>
                    )}
                  </div>
                  <p>
                    Session status: {session.status}. Ending a partial session
                    does not invent missing sets. Sync the finish action to
                    acknowledge it.
                  </p>
                  {conflict && (
                    <div className="error">
                      <h3>Conflicting saved versions</h3>
                      <p>
                        The first queued action conflicts. Later actions are
                        retained and may need separate review.
                      </p>
                      <button
                        onClick={() => {
                          void resolveConflict(false);
                        }}
                      >
                        Use account version
                      </button>
                      <button
                        onClick={() => {
                          void resolveConflict(true);
                        }}
                      >
                        Keep device edit and review
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
            {tab === "Schedule" && (
              <section className="panel">
                <h2>Scheduling contract lab</h2>
                <p>
                  Synthetic minimum gap: 1 day. Not a reviewed recovery
                  prescription. Date/sequence proof only.
                </p>
                <label>
                  Program
                  <select
                    value={program}
                    onChange={(e) => {
                      setProgram(e.target.value);
                      setWeekdays(
                        e.target.value === "strength" ? "1,2,4,5" : "1,3,5",
                      );
                    }}
                  >
                    {Programs.filter((p) => p.id !== "fit").map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.days} days/week
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Start on any date
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <label>
                  Preferred weekdays (0=Sun to 6=Sat)
                  <input
                    value={weekdays}
                    onChange={(e) => setWeekdays(e.target.value)}
                  />
                </label>
                <button
                  onClick={() => {
                    void createSchedule();
                  }}
                >
                  Generate synthetic schedule
                </button>
                <ol>
                  {scheduleData.data.map((s) => (
                    <li key={s.id}>
                      {s.id}: {s.plannedDate} · {s.status} · original{" "}
                      {s.originalDate}
                    </li>
                  ))}
                </ol>
                <label>
                  Move first pending session to
                  <input
                    type="date"
                    value={movedate}
                    onChange={(e) => setMoveDate(e.target.value)}
                  />
                </label>
                <p>
                  Moving a slot may move later pending slots to preserve order.
                  This is the explicit lab preview: original dates stay in
                  history; no completion or skip is implied.
                </p>
                <button
                  disabled={!scheduleData.data.length}
                  onClick={() => {
                    try {
                      setSchedulePreview(
                        reschedule(
                          scheduleData.data,
                          scheduleData.data[0].id,
                          movedate,
                          1,
                          scheduleData.data[0].revision,
                          weekdays.split(",").map(Number),
                        ),
                      );
                    } catch (e) {
                      setError(message(e));
                    }
                  }}
                >
                  Preview synthetic reschedule
                </button>
                {schedulePreview && (
                  <div className="bulk">
                    <h3>Proposed future dates</h3>
                    <ol>
                      {schedulePreview.map((s) => (
                        <li key={s.id}>
                          {s.id}: {s.plannedDate}
                        </li>
                      ))}
                    </ol>
                    <button
                      onClick={() => {
                        void moveFirst().then(() => setSchedulePreview(null));
                      }}
                    >
                      Confirm synthetic reschedule
                    </button>
                    <button onClick={() => setSchedulePreview(null)}>
                      Cancel reschedule
                    </button>
                  </div>
                )}
              </section>
            )}
            {tab === "History" && (
              <section className="panel">
                <h2>Recorded account snapshot</h2>
                <p>
                  This shows acknowledged actuals, not unconfirmed suggestions.
                  Synthetic records only.
                </p>
                <pre>
                  {JSON.stringify(
                    {
                      status: session.status,
                      actuals: session.actuals,
                      recommendedEffort:
                        conditioning?.prescription.effortTarget,
                      yourEffort: conditioning?.effort,
                    },
                    null,
                    2,
                  )}
                </pre>
                <a href="/api/export" target="_blank" rel="noreferrer">
                  Export own JSON
                </a>{" "}
                ·{" "}
                <a
                  href="/api/export?format=csv"
                  target="_blank"
                  rel="noreferrer"
                >
                  Export own CSV
                </a>
              </section>
            )}
          </>
        )}
      </main>
      <footer>
        Foundation 0.2.0 · Not deployed · No real users · No live AI
      </footer>
      {overlay && (
        <DemoOverlay
          close={closeOverlay}
          invoker={overlay.invoker}
          scroll={overlay.scroll}
        />
      )}
    </>
  );
}
