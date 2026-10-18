import type { ReactNode } from "react";
export type IconName =
  | "workout"
  | "program"
  | "visuals"
  | "progress"
  | "settings"
  | "clock"
  | "check"
  | "image"
  | "chevron"
  | "info"
  | "target";
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const shapes: Record<IconName, ReactNode> = {
    workout: (
      <>
        <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />
      </>
    ),
    program: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 2v4M15 2v4M9 10h6M9 14h6M9 18h3" />
      </>
    ),
    visuals: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m4 17 5-5 4 4 3-3 5 5" />
      </>
    ),
    progress: (
      <>
        <path d="M5 20v-5M12 20V9M19 20V4" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3 1-1h4l1 3 3 1 3 2-1 3 1 3-3 2-1 3-3 1-3-1-3 1-2-3-3-2 1-3-1-3 3-2 1-3Z" />
        <circle cx="12" cy="11" r="3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="m4 17 5-5 4 4 3-3 5 5" />
        <circle cx="8" cy="9" r="1.5" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7v1" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="m12 12 8-8M17 4h3v3" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}
export function MediaPlaceholder({ large = false }: { large?: boolean }) {
  return (
    <span
      className={"media-placeholder " + (large ? "media-large" : "")}
      aria-hidden="true"
    >
      <Icon name="image" size={large ? 36 : 22} />
      <span>Media pending</span>
    </span>
  );
}
export function displayName(name: string) {
  const label = name.replace(/^Demo /, "").replace(/^demo /, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
