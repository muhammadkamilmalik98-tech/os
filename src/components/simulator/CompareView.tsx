"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Play, Trophy } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import type { CompareResult } from "@/lib/types";

const BARS = ["#3ddc97", "#ffb224", "#4cc9f0", "#a78bfa"];

export function CompareView() {
  const comparison = useSimulationStore((s) => s.comparison);
  const setResult = useSimulationStore((s) => s.setResult);

  if (!comparison || comparison.length === 0) return null;

  const bestUtil = Math.max(...comparison.map((r) => r.summary.utilization));
  const fewestUnalloc = Math.min(
    ...comparison.map((r) => r.summary.unallocated),
  );
  const winner =
    comparison.find(
      (r) =>
        r.summary.utilization === bestUtil &&
        r.summary.unallocated === fewestUnalloc,
    ) ?? comparison.find((r) => r.summary.utilization === bestUtil);

  const chartData = comparison.map((r) => ({
    name: r.label,
    utilization: r.summary.utilization,
  }));

  return (
    <div className="space-y-5 rise">
      {winner && (
        <div className="panel flex items-center gap-3 px-5 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-signal/50 bg-signal/10">
            <Trophy className="h-5 w-5 text-signal" />
          </div>
          <div>
            <span className="label">Best for this workload</span>
            <div className="font-display text-lg font-bold text-fg">
              {winner.label}
              <span className="ml-2 font-mono text-sm font-normal text-phosphor">
                {winner.summary.utilization}% util · {winner.summary.placed}{" "}
                placed
              </span>
            </div>
          </div>
        </div>
      )}

      <section className="panel overflow-x-auto">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="label !text-muted">Strategy comparison</span>
          <span className="label">green = best</span>
        </div>
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="text-left">
              {[
                "Strategy",
                "Util",
                "Used",
                "Int. frag",
                "Ext. frag",
                "Placed",
                "Unalloc",
                "",
              ].map((h) => (
                <th key={h} className="label px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((r) => (
              <Row
                key={r.strategy}
                result={r}
                bestUtil={r.summary.utilization === bestUtil}
                bestPlacement={r.summary.unallocated === fewestUnalloc}
                isWinner={r.strategy === winner?.strategy}
                onReplay={() => setResult(r.strategy, r.timeline)}
              />
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel p-5">
        <span className="label !text-muted">Utilization by strategy</span>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1b1f29" />
              <XAxis dataKey="name" stroke="#565c6b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#565c6b" fontSize={11} unit="%" />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#0d0f15",
                  border: "1px solid #2a3040",
                  borderRadius: 10,
                  color: "#e8eaf2",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
              />
              <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BARS[i % BARS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Row({
  result,
  bestUtil,
  bestPlacement,
  isWinner,
  onReplay,
}: {
  result: CompareResult;
  bestUtil: boolean;
  bestPlacement: boolean;
  isWinner: boolean;
  onReplay: () => void;
}) {
  const s = result.summary;
  return (
    <tr
      className={
        "border-t border-line font-mono " +
        (isWinner ? "bg-signal/[0.05]" : "")
      }
    >
      <Td className="font-display text-sm font-semibold text-fg">
        <span className="flex items-center gap-2">
          {isWinner && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_6px_var(--color-signal)]" />
          )}
          {result.label}
        </span>
      </Td>
      <Td className={bestUtil ? "font-semibold text-phosphor" : "text-fg"}>
        {s.utilization}%
      </Td>
      <Td>{s.used}</Td>
      <Td className="text-signal">{s.internalFragmentation}</Td>
      <Td className="text-signal">{s.externalFragmentation}</Td>
      <Td className={bestPlacement ? "font-semibold text-phosphor" : "text-fg"}>
        {s.placed}
      </Td>
      <Td className={s.unallocated > 0 ? "text-danger" : "text-faint"}>
        {s.unallocated}
      </Td>
      <Td>
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1 rounded-md border border-line2 bg-ink px-2.5 py-1 text-xs text-muted transition hover:border-signal hover:text-signal"
        >
          <Play className="h-3 w-3" fill="currentColor" /> Replay
        </button>
      </Td>
    </tr>
  );
}

function Td({
  children,
  className = "text-muted",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={"px-4 py-2.5 " + className}>{children}</td>;
}
