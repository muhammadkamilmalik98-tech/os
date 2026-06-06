import { create } from "zustand";
import type {
  BlockInput,
  CompareResult,
  OperationInput,
  ProcessInput,
  TimelineEvent,
} from "@/lib/types";

type Status = "idle" | "loading" | "ready" | "error";

/** The exact workload behind the current single-strategy run (enables editing). */
export interface RunConfig {
  blocks: BlockInput[];
  processes: ProcessInput[];
  strategy: string;
  operations: OperationInput[];
}

interface SimulationState {
  strategy: string;
  timeline: TimelineEvent[];
  cursor: number;
  config: RunConfig | null;
  comparison: CompareResult[] | null;
  status: Status;
  error: string | null;
  playing: boolean;
  speed: number;

  setResult: (
    strategy: string,
    timeline: TimelineEvent[],
    config?: RunConfig | null,
  ) => void;
  setRerun: (
    strategy: string,
    timeline: TimelineEvent[],
    config: RunConfig,
  ) => void;
  setComparison: (results: CompareResult[]) => void;
  setStatus: (status: Status) => void;
  setError: (error: string) => void;
  setCursor: (cursor: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
}

const clamp = (value: number, max: number) =>
  Math.max(0, Math.min(value, max));

export const useSimulationStore = create<SimulationState>((set) => ({
  strategy: "first_fit",
  timeline: [],
  cursor: 0,
  config: null,
  comparison: null,
  status: "idle",
  error: null,
  playing: false,
  speed: 1,

  // A fresh run auto-plays from the start so "Run" delivers its own payoff.
  setResult: (strategy, timeline, config = null) =>
    set({
      strategy,
      timeline,
      cursor: 0,
      config,
      comparison: null,
      status: "ready",
      error: null,
      playing: timeline.length > 1,
    }),
  // Re-run after an edit (e.g. deallocate): jump to the result, don't replay.
  setRerun: (strategy, timeline, config) =>
    set({
      strategy,
      timeline,
      cursor: Math.max(0, timeline.length - 1),
      config,
      comparison: null,
      status: "ready",
      error: null,
      playing: false,
    }),
  setComparison: (results) =>
    set({
      comparison: results,
      timeline: [],
      cursor: 0,
      config: null,
      status: "ready",
      error: null,
      playing: false,
    }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  setCursor: (cursor) =>
    set((s) => ({ cursor: clamp(cursor, s.timeline.length - 1) })),
  next: () =>
    set((s) => ({ cursor: clamp(s.cursor + 1, s.timeline.length - 1) })),
  prev: () =>
    set((s) => ({ cursor: clamp(s.cursor - 1, s.timeline.length - 1) })),
  reset: () => set({ cursor: 0 }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
}));
