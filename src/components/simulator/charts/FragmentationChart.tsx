"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSimulationStore } from "@/store/simulationStore";

const TOOLTIP_STYLE = {
  background: "#0d0f15",
  border: "1px solid #2a3040",
  borderRadius: 10,
  color: "#e8eaf2",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
} as const;

export function FragmentationChart() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);

  if (timeline.length === 0) return null;

  const data = timeline.map((e, i) => ({
    step: i,
    internal: e.metrics.internalFragmentation,
    external: e.metrics.externalFragmentation,
  }));

  return (
    <section className="panel p-5">
      <span className="label !text-muted">Fragmentation / step</span>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="fragInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb224" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ffb224" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fragExt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4cc9f0" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4cc9f0" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1b1f29" />
            <XAxis dataKey="step" stroke="#565c6b" fontSize={11} />
            <YAxis stroke="#565c6b" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="internal"
              name="Internal"
              stroke="#ffb224"
              fill="url(#fragInt)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="external"
              name="External"
              stroke="#4cc9f0"
              fill="url(#fragExt)"
              strokeWidth={2}
            />
            <ReferenceLine x={cursor} stroke="#3ddc97" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
