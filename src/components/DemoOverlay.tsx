import { useEffect, useRef, useState } from "react";
import { canonicalExercise } from "../domain/fixtures";
export type ExerciseInformation = {
  id: string;
  version: number;
  name: string;
  frames: string[];
  cues: string[];
};
export function DemoOverlay({
  close,
  invoker,
  scroll,
  exercise = canonicalExercise,
}: {
  exercise?: ExerciseInformation;
  close: () => void;
  invoker: HTMLElement | null;
  scroll: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [frame, setFrame] = useState(0);
  const touch = useRef(0);
  useEffect(() => {
    const d = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    d.showModal();
    history.pushState({ eaOverlay: true }, "", location.href);
    const pop = () => close();
    const cancel = (e: Event) => {
      e.preventDefault();
      history.back();
    };
    window.addEventListener("popstate", pop);
    d.addEventListener("cancel", cancel);
    return () => {
      window.removeEventListener("popstate", pop);
      d.removeEventListener("cancel", cancel);
      d.close();
      document.body.style.overflow = overflow;
      invoker?.focus({ preventScroll: true });
      window.scrollTo(0, scroll);
    };
  }, [close, invoker, scroll]);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="demo-title"
      onTouchStart={(e) => {
        touch.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const distance = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(distance) > 50)
          setFrame((x) =>
            Math.max(0, Math.min(2, x + (distance < 0 ? 1 : -1))),
          );
      }}
    >
      <header>
        <h2 id="demo-title">{exercise.name}</h2>
        <button
          onClick={() => history.back()}
          aria-label="Close exercise demonstration"
        >
          Close ×
        </button>
      </header>
      <p className="warning">Synthetic media · Not exercise instruction</p>
      <div
        className="placeholder"
        role="img"
        aria-label={exercise.frames[frame]}
      >
        {exercise.frames[frame]}
      </div>
      <p aria-live="polite">Frame {frame + 1} of 3</p>
      <div className="actions">
        <button disabled={frame === 0} onClick={() => setFrame((x) => x - 1)}>
          Previous frame
        </button>
        <button disabled={frame === 2} onClick={() => setFrame((x) => x + 1)}>
          Next frame
        </button>
      </div>
      <ul>
        {exercise.cues.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p>
        Canonical content: {exercise.id} / v{exercise.version}. Shared by
        workout and reference contracts.
      </p>
    </dialog>
  );
}
