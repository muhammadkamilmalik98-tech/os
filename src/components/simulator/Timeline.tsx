"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useReplay } from "@/hooks/useReplay";

const SPEEDS = [0.5, 1, 2, 4];

const EVENT_META: Record<string, { color: string; glyph: string }> = {
  init: { color: "text-muted", glyph: "◆" },
  allocate: { color: "text-phosphor", glyph: "▲" },
  allocate_failed: { color: "text-danger", glyph: "✕" },
  deallocate: { color: "text-cyan", glyph: "▽" },
};

export function Timeline() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);
  const strategy = useSimulationStore((s) => s.strategy);
  const next = useSimulationStore((s) => s.next);
  const prev = useSimulationStore((s) => s.prev);
  const reset = useSimulationStore((s) => s.reset);
  const setCursor = useSimulationStore((s) => s.setCursor);

  const { playing, toggle, speed, setSpeed } = useReplay();

  if (timeline.length === 0) return null;

  const frame = timeline[cursor];
  const last = timeline.length - 1;
  const meta = EVENT_META[frame.type] ?? EVENT_META.init;

  return (
    <section className="panel">
      <div className="flex flex-wrap items-center gap-4 px-5 py-3.5">
        {/* step readout */}
        <div className="flex items-baseline gap-2">
          <span className="label">step</span>
          <span className="font-display text-2xl font-bold leading-none text-fg">
            {String(cursor).padStart(2, "0")}
          </span>
          <span className="font-mono text-sm text-faint">
            / {String(last).padStart(2, "0")}
          </span>
        </div>

        <span className="hidden font-mono text-[11px] text-faint sm:inline">
          {strategy.replace("_", " ")}
        </span>

        {/* transport */}
        <div className="ml-auto flex items-center gap-1.5">
          <Transport onClick={toggle} primary label={playing ? "Pause" : "Play"}>
            {playing ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" />
            )}
          </Transport>
          <Transport onClick={prev} disabled={cursor === 0} label="Previous step">
            <ChevronLeft className="h-4 w-4" />
          </Transport>
          <Transport onClick={next} disabled={cursor === last} label="Next step">
            <ChevronRight className="h-4 w-4" />
          </Transport>
          <Transport onClick={reset} disabled={cursor === 0} label="Reset">
            <RotateCcw className="h-4 w-4" />
          </Transport>

          <div className="ml-1 flex items-center gap-0.5 rounded-lg border border-line2 bg-ink p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                className={
                  "rounded-md px-1.5 py-1 text-[11px] font-semibold transition " +
                  (speed === s
                    ? "bg-signal text-ink"
                    : "text-faint hover:text-fg")
                }
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <input
          type="range"
          min={0}
          max={last}
          value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          aria-label="Timeline step"
          className="w-full"
        />
      </div>

      {/* console line */}
      <div className="flex items-start gap-2 border-t border-line bg-ink/50 px-5 py-3 font-mono text-[13px]">
        <span className={`${meta.color} shrink-0`}>{meta.glyph}</span>
        <span className="shrink-0 text-faint">›</span>
        <span className="text-fg/90 caret">{frame.message}</span>
      </div>
    </section>
  );
}

function Transport({
  children,
  onClick,
  disabled,
  primary,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        "grid h-9 w-9 place-items-center rounded-lg border transition disabled:opacity-35 " +
        (primary
          ? "border-signal/60 bg-signal/15 text-signal hover:bg-signal/25"
          : "border-line2 bg-ink text-muted hover:border-line2 hover:text-fg")
      }
    >
      {children}
    </button>
  );
}
