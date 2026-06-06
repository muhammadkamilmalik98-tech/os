"use client";

import { useEffect, useState } from "react";
import { GitCompare, Loader2, Play, Sparkles } from "lucide-react";
import { fetchStrategies, runComparison, runSimulation } from "@/lib/api";
import { useSimulationStore } from "@/store/simulationStore";
import type { StrategyInfo } from "@/lib/types";

function parseSizes(input: string): number[] {
  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

const PRESETS = [
  { name: "Textbook", blocks: "100, 500, 200, 300, 600", processes: "212, 417, 112, 426" },
  { name: "Tight", blocks: "50, 80, 120, 200", processes: "100, 60, 180, 40" },
  { name: "Spacious", blocks: "300, 600, 350, 700, 250", processes: "212, 417, 112, 426, 300" },
];

const FALLBACK: StrategyInfo[] = [
  { key: "first_fit", label: "First", description: "" },
  { key: "best_fit", label: "Best", description: "" },
  { key: "worst_fit", label: "Worst", description: "" },
];

export function ControlPanel() {
  const [blocks, setBlocks] = useState(PRESETS[0].blocks);
  const [processes, setProcesses] = useState(PRESETS[0].processes);
  const [strategy, setStrategy] = useState("first_fit");
  const [strategies, setStrategies] = useState<StrategyInfo[]>(FALLBACK);
  const [localError, setLocalError] = useState<string | null>(null);

  const status = useSimulationStore((s) => s.status);
  const setStatus = useSimulationStore((s) => s.setStatus);
  const setError = useSimulationStore((s) => s.setError);
  const setResult = useSimulationStore((s) => s.setResult);
  const setComparison = useSimulationStore((s) => s.setComparison);

  useEffect(() => {
    fetchStrategies()
      .then((s) => s.length && setStrategies(s))
      .catch(() => {});
  }, []);

  function readWorkload() {
    const blockSizes = parseSizes(blocks);
    const processSizes = parseSizes(processes);
    if (blockSizes.length === 0 || processSizes.length === 0) {
      setLocalError("Enter at least one block and one process size.");
      return null;
    }
    setLocalError(null);
    return {
      blocks: blockSizes.map((size) => ({ size })),
      processes: processSizes.map((size, i) => ({ name: `P${i + 1}`, size })),
    };
  }

  async function handleRun() {
    const workload = readWorkload();
    if (!workload) return;
    setStatus("loading");
    try {
      const res = await runSimulation({ ...workload, strategy });
      setResult(res.strategy, res.timeline, {
        ...workload,
        strategy,
        operations: workload.processes.map((p) => ({
          type: "allocate" as const,
          process: p.name,
        })),
      });
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  async function handleCompare() {
    const workload = readWorkload();
    if (!workload) return;
    setStatus("loading");
    try {
      const res = await runComparison(workload);
      setComparison(res.results);
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  const loading = status === "loading";
  const segments = strategies.length === 3 ? strategies : FALLBACK;

  return (
    <section className="panel rise overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="label !text-muted">Console</span>
        <span className="label">cfg://workload</span>
      </div>

      <div className="space-y-5 p-5">
        {/* presets */}
        <div>
          <span className="label mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setBlocks(p.blocks);
                  setProcesses(p.processes);
                  setLocalError(null);
                }}
                className="rounded-md border border-line2 bg-ink px-2.5 py-1 text-[11px] text-muted transition hover:border-signal hover:text-signal"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <Field label="Memory blocks" hint="sizes" htmlFor="blocks">
          <input
            id="blocks"
            value={blocks}
            onChange={(e) => setBlocks(e.target.value)}
            placeholder="100, 500, 200, 300, 600"
            className="field"
          />
        </Field>

        <Field label="Processes" hint="sizes → P1..Pn" htmlFor="processes">
          <input
            id="processes"
            value={processes}
            onChange={(e) => setProcesses(e.target.value)}
            placeholder="212, 417, 112, 426"
            className="field"
          />
        </Field>

        {/* segmented strategy */}
        <div>
          <span className="label mb-2 block">Strategy</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line2 bg-ink p-1">
            {segments.map((s) => {
              const active = strategy === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStrategy(s.key)}
                  aria-pressed={active}
                  className={
                    "rounded-lg px-2 py-2 text-xs font-semibold tracking-wide transition " +
                    (active
                      ? "bg-signal text-ink shadow-[0_0_18px_rgba(255,178,36,0.35)]"
                      : "text-muted hover:text-fg")
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {localError && (
          <p role="alert" className="text-xs text-danger">
            ! {localError}
          </p>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={handleRun}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" />
            )}
            {loading ? "Running…" : "Run Simulation"}
          </button>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line2 bg-surface2 px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-phosphor hover:text-phosphor disabled:opacity-60"
          >
            <GitCompare className="h-4 w-4" />
            Compare All Strategies
          </button>
        </div>
      </div>
    </section>
  );
}

function messageFrom(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Request failed. Is the backend running on :8000?";
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="label">{label}</span>
        {hint && <span className="label !text-line2">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
