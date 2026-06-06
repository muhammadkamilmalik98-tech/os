"use client";

import { useSimulationStore } from "@/store/simulationStore";
import { NumberTicker } from "@/components/magicui/NumberTicker";

export function StatsPanel() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);

  const frame = timeline[cursor];
  if (!frame) {
    return (
      <div className="panel grid min-h-72 place-items-center text-faint">
        <span className="label">no telemetry</span>
      </div>
    );
  }

  const m = frame.metrics;

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="label !text-muted">Telemetry</span>
        <span className="label">live</span>
      </div>

      <div className="space-y-4 p-5">
        {/* utilization gauge */}
        <div className="rounded-xl border border-line bg-ink p-4">
          <div className="mb-2 flex items-end justify-between">
            <span className="label">Memory utilization</span>
            <span className="font-display text-3xl font-bold leading-none text-phosphor">
              <NumberTicker value={m.utilization} decimals={1} suffix="%" />
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-phosphor to-signal shadow-[0_0_12px_rgba(61,220,151,0.5)] transition-[width] duration-500 ease-out"
              style={{ width: `${m.utilization}%` }}
            />
          </div>
        </div>

        {/* readouts */}
        <div className="grid grid-cols-2 gap-2.5">
          <Readout label="Used" value={m.used} tone="phosphor" />
          <Readout label="Free" value={m.free} />
          <Readout label="Internal frag" value={m.internalFragmentation} tone="signal" />
          <Readout label="External frag" value={m.externalFragmentation} tone="signal" />
        </div>

        {/* unallocated */}
        <div className="rounded-xl border border-line bg-ink p-4">
          <span className="label mb-2 block">Unallocated processes</span>
          {frame.unallocated.length === 0 ? (
            <span className="font-mono text-sm text-phosphor">
              ✓ all processes placed
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {frame.unallocated.map((name) => (
                <span
                  key={name}
                  className="rounded-md border border-danger/40 bg-danger/10 px-2 py-0.5 font-mono text-xs text-danger"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "phosphor" | "signal";
}) {
  const color =
    tone === "phosphor"
      ? "text-phosphor"
      : tone === "signal"
        ? "text-signal"
        : "text-fg";
  return (
    <div className="rounded-xl border border-line bg-ink p-3">
      <span className="label">{label}</span>
      <div className={`mt-1 font-display text-xl font-bold ${color}`}>
        <NumberTicker value={value} />
      </div>
    </div>
  );
}
