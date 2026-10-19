import { useEffect, useRef, useState } from "react";

// Counts only observed foreground ticks. A gap is an interruption, never
// inferred exercise effort. Checkpoints are local UI recovery, not workout data.
export function SetStopwatch({
  id,
  active,
  onStop,
}: {
  id: string;
  active: boolean;
  onStop: (seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [message, setMessage] = useState("");
  const state = useRef({ running: false, ms: 0, last: 0 });
  const callback = useRef(onStop);
  callback.current = onStop;
  const key = `ea-set-stopwatch:${id}`;
  function stop(interrupted = false) {
    const s = state.current;
    if (!s.running) return;
    s.running = false;
    setRunning(false);
    const value = Math.floor(s.ms / 1000);
    if (value > 0) callback.current(value);
    setMessage(
      interrupted
        ? "Stopped on interruption. Check seconds, then tap Done."
        : "Seconds filled in. Check them, then tap Done.",
    );
    sessionStorage.removeItem(key);
  }
  useEffect(() => {
    const recovered = sessionStorage.getItem(key);
    if (recovered && /^\d+$/.test(recovered)) {
      const n = Number(recovered);
      if (n > 0 && n <= 86400) {
        setSeconds(n);
        callback.current(n);
        setMessage(
          "Interrupted stopwatch: last observed seconds recovered. Check before Done.",
        );
      }
      sessionStorage.removeItem(key);
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
          setMessage(
            "Only foreground time is measured. Stop fills Seconds; Done records the set.",
          );
        }}
      >
        {running ? "Stop" : "Start hold"} · {seconds}s
      </button>
      {message && <small role="status">{message}</small>}
    </div>
  );
}
