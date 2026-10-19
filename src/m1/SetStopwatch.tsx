import { useEffect, useRef, useState } from "react";

// Counts only observed foreground ticks. A gap is an interruption, never
// inferred exercise effort. Checkpoints are local UI recovery, not workout data.
export function SetStopwatch({
  id,
  active,
  onStop,
  onRunning,
}: {
  id: string;
  active: boolean;
  onStop: (seconds: number) => void;
  onRunning: (running: boolean) => void;
}) {
  const [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [message, setMessage] = useState("");
  const state = useRef({ running: false, ms: 0, last: 0 });
  const callback = useRef(onStop);
  callback.current = onStop;
  const runningCallback = useRef(onRunning);
  runningCallback.current = onRunning;
  const key = `ea-set-stopwatch:${id}`;
  function stop(interrupted = false) {
    const s = state.current;
    if (!s.running) return;
    s.running = false;
    setRunning(false);
    runningCallback.current(false);
    const value = Math.floor(s.ms / 1000);
    if (value > 0) callback.current(value);
    setMessage(
      value === 0
        ? "Less than one second measured. No duration entered; check Seconds before Done."
        : interrupted
          ? "Stopped on interruption. Check seconds, then tap Done."
          : "Seconds filled in. Check them, then tap Done.",
    );
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* No checkpoint storage; saved set data is independent. */
    }
  }
  useEffect(() => {
    let recovered: string | null = null;
    try {
      recovered = sessionStorage.getItem(key);
    } catch {
      /* Optional UI checkpoint unavailable. */
    }
    if (recovered && /^\d+$/.test(recovered)) {
      const n = Number(recovered);
      if (n > 0 && n <= 86400) {
        setSeconds(n);
        callback.current(n);
        setMessage(
          "Interrupted stopwatch: last observed seconds recovered. Check before Done.",
        );
      }
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* best effort */
      }
    }
    const tick = setInterval(() => {
      const s = state.current;
      if (!s.running) return;
      const now = performance.now(),
        gap = now - s.last;
      if (document.hidden || gap > 1500 || gap < 0) {
        stop(true);
        return;
      }
      s.ms += gap;
      s.last = now;
      const n = Math.floor(s.ms / 1000);
      setSeconds(n);
      try {
        sessionStorage.setItem(key, String(n));
      } catch {
        /* best-effort observed-time checkpoint */
      }
    }, 200);
    const interrupt = () => {
      if (document.hidden) stop(true);
    };
    const pagehide = () => stop(true);
    document.addEventListener("visibilitychange", interrupt);
    window.addEventListener("pagehide", pagehide);
    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", interrupt);
      window.removeEventListener("pagehide", pagehide);
      stop(true);
    };
    // One instance per row; callback ref stays current without restarting ticks.
  }, [key]);
  useEffect(() => {
    if (!active) stop(true);
  }, [active]);
  return (
    <div className="set-stopwatch">
      <div className="stopwatch-controls">
        <button
          disabled={!active && !running}
          type="button"
          aria-label={
            running ? "Stop exercise stopwatch" : "Start exercise stopwatch"
          }
          onClick={() => {
            if (running) {
              stop();
              return;
            }
            state.current = { running: true, ms: 0, last: performance.now() };
            setSeconds(0);
            setRunning(true);
            runningCallback.current(true);
            setMessage(
              "Only foreground time is measured. Stop fills Seconds; Done records the set.",
            );
          }}
        >
          {running ? "Stop" : "Start"}
        </button>
        <span
          className="stopwatch-readout"
          role="timer"
          aria-label="Observed exercise time"
        >
          {seconds}s
        </span>
      </div>
      {message && <small role="status">{message}</small>}
    </div>
  );
}
