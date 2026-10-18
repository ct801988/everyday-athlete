import { useEffect, useRef, useState } from "react";
import type { Dataset } from "./model";
import { clock, remaining, type Timer } from "./timer";
export type TimerCommand =
  | { type: "start"; runId: string }
  | { type: "reset" }
  | { type: "select"; seconds: number }
  | { type: "default" }
  | { type: "alert"; alert: "silent" | "short-beep" }
  | { type: "finish"; runId: string; at: number };
export function RestTimer({
  data,
  command,
}: {
  data: Dataset;
  command: (c: TimerCommand) => Promise<boolean>;
}) {
  const t = data.view.timer;
  const [expanded, setExpanded] = useState(false),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0),
    [message, setMessage] = useState(""),
    [custom, setCustom] = useState(String(t.selectedSeconds));
  const eligible = useRef<string | null>(null),
    finishing = useRef(false),
    audio = useRef<AudioContext | null>(null),
    mounted = useRef(true),
    anchor = useRef<{ run: string | null; wall: number; mono: number }>({
      run: null,
      wall: 0,
      mono: 0,
    });
  // Monotonic elapsed time in an active document; persisted wall-clock deadline
  // is used after reload. Device clock changes during absence remain a limitation.
  if (anchor.current.run !== t.runId)
    anchor.current = {
      run: t.runId,
      wall: Date.now(),
      mono: performance.now(),
    };
  const now =
    t.status === "running"
      ? Math.max(
          Date.now(),
          anchor.current.wall + performance.now() - anchor.current.mono,
        )
      : Date.now();
  const seconds = remaining(t, now);
  const shown = useRef<{ id: string | null; until: number }>({
    id: null,
    until: 0,
  });
  if (
    !document.hidden &&
    t.completedRunId &&
    shown.current.id !== t.completedRunId
  )
    shown.current = { id: t.completedRunId, until: Date.now() + 4000 };
  const completion =
    t.completedRunId !== null && Date.now() < shown.current.until;
  useEffect(() => {
    mounted.current = true;
    const interval = setInterval(() => setTick((v) => v + 1), 200);
    const hidden = () => {
      if (document.hidden) eligible.current = null;
      setTick((v) => v + 1);
    };
    const wake = () => setTick((v) => v + 1);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pageshow", wake);
    window.addEventListener("focus", wake);
    return () => {
      mounted.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pageshow", wake);
      window.removeEventListener("focus", wake);
      void audio.current?.close();
    };
  }, []);
  async function send(c: TimerCommand) {
    setBusy(true);
    try {
      return await command(c);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (t.status !== "running" || seconds > 0 || finishing.current || busy)
      return;
    const runId = t.runId!;
    finishing.current = true;
    void command({
      type: "finish",
      runId,
      at: Math.max(Date.now(), t.deadline!),
    })
      .then((claimed) => {
        if (
          claimed &&
          mounted.current &&
          eligible.current === runId &&
          !document.hidden &&
          data.preferences.timer.alert === "short-beep"
        ) {
          eligible.current = null;
          const ctx = audio.current;
          if (ctx?.state !== "running") {
            setMessage("Sound unavailable. Completion is visual only.");
            return;
          }
          const o = ctx.createOscillator(),
            g = ctx.createGain();
          o.frequency.value = 660;
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.16);
        }
      })
      .finally(() => {
        finishing.current = false;
      });
  }, [t, seconds, busy, command, data.preferences.timer.alert, tick]);
  async function start() {
    const runId = crypto.randomUUID();
    if (data.preferences.timer.alert === "short-beep") {
      try {
        audio.current ??= new AudioContext();
        void audio.current
          .resume()
          .catch(() =>
            setMessage("Sound unavailable. Completion is visual only."),
          );
      } catch {
        setMessage("Sound unavailable. Completion is visual only.");
      }
    }
    eligible.current = runId;
    if (!(await send({ type: "start", runId }))) eligible.current = null;
  }
  function reset() {
    setExpanded(false);
    eligible.current = null;
    setMessage("");
    void send({ type: "reset" });
  }
  function select(seconds: number) {
    setCustom(String(seconds));
    void send({ type: "select", seconds });
  }
  const state =
    t.status === "running" ? "Running" : completion ? "Rest complete" : "Ready";
  return (
    <aside
      className={`timer-dock ${completion ? "timer-complete" : ""}`}
      aria-label="Rest timer controls"
    >
      <div className="timer-bar">
        <div className="timer-copy">
          <span className="eyebrow">Rest · {state}</span>
          <output aria-label="Rest timer" aria-live="off">
            {clock(completion ? 0 : seconds)}
          </output>
        </div>
        {t.status === "running" || completion ? (
          <button
            className="timer-stop"
            aria-label="Stop and reset rest timer"
            disabled={busy}
            onClick={reset}
          >
            ×<span className="sr-only"> Stop &amp; Reset</span>
          </button>
        ) : (
          <button
            className="primary"
            disabled={busy}
            onClick={() => void start()}
          >
            Start
          </button>
        )}
        <button
          className="timer-expand"
          aria-label={
            expanded ? "Collapse timer options" : "Expand timer options"
          }
          aria-expanded={expanded}
          aria-controls="timer-options"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "⌄" : "⌃"}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {state}
      </span>
      {expanded && (
        <div id="timer-options" className="timer-options">
          <p className="muted">
            Choose your rest. No approved workout rest recommendation is
            available.
          </p>
          <fieldset disabled={busy || t.status === "running"}>
            <legend>Selected duration</legend>
            <div className="presets">
              {[
                [30, "30 sec"],
                [60, "1 min"],
                [120, "2 min"],
                [180, "3 min"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={t.selectedSeconds === v}
                  onClick={() => select(Number(v))}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(custom);
                if (n < 5 || n > 3600 || n % 5 !== 0) {
                  setMessage(
                    "Choose 5–3600 seconds in five-second increments.",
                  );
                  return;
                }
                setMessage("");
                select(n);
              }}
            >
              <label>
                Custom duration (seconds)
                <input
                  aria-label="Custom duration in seconds"
                  type="number"
                  min="5"
                  max="3600"
                  step="5"
                  inputMode="numeric"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />
              </label>
              <button type="submit">Set duration</button>
            </form>
            <button onClick={() => void send({ type: "default" })}>
              Use selected as my default
            </button>
          </fieldset>
          <p className="muted">
            Default {clock(data.preferences.timer.preferredSeconds)} · Selected{" "}
            {clock(t.selectedSeconds)}
            {t.status === "running" ? " · Reset to change duration" : ""}
          </p>
          <label>
            Completion alert
            <select
              aria-label="Completion alert"
              disabled={busy || t.status === "running"}
              value={data.preferences.timer.alert}
              onChange={(e) =>
                void send({
                  type: "alert",
                  alert: e.target.value as "silent" | "short-beep",
                })
              }
            >
              <option value="silent">Silent</option>
              <option value="short-beep">Short beep</option>
            </select>
          </label>
          <p className="muted">
            One brief beep, only while this screen stays active. Returning after
            an interruption gives visual completion only. iPhone sound
            restrictions may apply.
          </p>
          {message && <p role="status">{message}</p>}
        </div>
      )}
    </aside>
  );
}
// Re-export the state type for callers without coupling to the display component.
export type { Timer };
