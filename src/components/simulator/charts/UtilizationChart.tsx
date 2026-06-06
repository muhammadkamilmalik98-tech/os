"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function UtilizationChart() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);

  if (timeline.length === 0) return null;

  const data = timeline.map((e, i) => ({
    step: i,
    utilization: e.metrics.utilization,
  }));

  return (
    <section className="panel p-5">
      <span className="label !text-muted">Utilization / step</span>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ddc97" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3ddc97" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1b1f29" />
            <XAxis dataKey="step" stroke="#565c6b" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="#565c6b" fontSize={11} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="utilization"
              name="Utilization %"
              stroke="#3ddc97"
              fill="url(#util)"
              strokeWidth={2}
            />
            <ReferenceLine x={cursor} stroke="#ffb224" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
