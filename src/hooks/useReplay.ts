"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * Drives auto-replay from the shared store. Playback state lives in the store so
 * a fresh "Run" can start the animation itself — the transport is for
 * re-watching, not a required gate to see the first result.
 */
export function useReplay() {
  const cursor = useSimulationStore((s) => s.cursor);
  const timeline = useSimulationStore((s) => s.timeline);
  const next = useSimulationStore((s) => s.next);
  const setCursor = useSimulationStore((s) => s.setCursor);
  const playing = useSimulationStore((s) => s.playing);
  const setPlaying = useSimulationStore((s) => s.setPlaying);
  const speed = useSimulationStore((s) => s.speed);
  const setSpeed = useSimulationStore((s) => s.setSpeed);

  const last = Math.max(0, timeline.length - 1);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= last) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => next(), 900 / speed);
    return () => clearTimeout(id);
  }, [playing, cursor, last, speed, next, setPlaying]);

  function toggle() {
    if (timeline.length === 0) return;
    if (cursor >= last) setCursor(0); // at the end → replay from the start
    setPlaying(!playing);
  }

  return { playing, toggle, speed, setSpeed };
}
