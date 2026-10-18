import type { Prescription, SetValues } from "./contracts";
export const ALICE = "11111111-1111-4111-8111-111111111111",
  BOB = "22222222-2222-4222-8222-222222222222";
export const ALICE_SESSION = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  BOB_SESSION = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const ALICE_CONDITIONING = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  BOB_CONDITIONING = "ffffffff-ffff-4fff-8fff-ffffffffffff";
export const values: SetValues = {
  load: { kind: "external", value: 50, unit: "lb", basis: "per_dumbbell" },
  reps: 10,
  seconds: null,
  rir: null,
  rirCapped: false,
};
export const prescription: Prescription = {
  modality: "strength",
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  programId: "foundation",
  programVersion: 1,
  sessionTemplateVersion: 1,
  phase: "normal",
  variation: "synthetic-db-press",
  protocol: "three-by-eight-to-twelve-v1",
  setCount: 3,
  low: 8,
  high: 12,
  suggested: values,
  effortTarget: null,
  synthetic: true,
};
export const canonicalExercise = {
  id: "synthetic-db-press",
  version: 1,
  name: "Synthetic dumbbell press",
  frames: ["Start placeholder", "Movement placeholder", "Finish placeholder"],
  cues: [
    "Placeholder content — not exercise instruction.",
    "No reviewed training media is included in this foundation.",
  ],
};

export const conditioningPrescription: Prescription = {
  ...prescription,
  id: "99999999-9999-4999-8999-999999999999",
  modality: "conditioning",
  programId: "fit",
  variation: "synthetic-walk",
  protocol: "synthetic-walk-v1",
  setCount: 1,
  suggested: {
    load: { kind: "none" },
    reps: null,
    seconds: 1200,
    rir: null,
    rirCapped: false,
  },
  effortTarget: {
    min: 5,
    max: 6,
    scale: "synthetic-effort",
    scaleVersion: 1,
    descriptor: "Moderate (synthetic fixture)",
    feel: "Illustrative cue only; not a reviewed real session.",
  },
};

export const canonicalConditioningExercise = {
  id: "synthetic-walk",
  version: 1,
  name: "Synthetic conditioning example",
  frames: ["Start placeholder", "Movement placeholder", "Finish placeholder"],
  cues: [
    "Placeholder content — not exercise instruction.",
    "No reviewed conditioning guidance or media is included.",
  ],
};
