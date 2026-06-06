"use client";

import { MemoryStick, Boxes } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Timeline } from "@/components/simulator/Timeline";
import { MemoryStrip } from "@/components/simulator/MemoryStrip";
import { StatsPanel } from "@/components/simulator/StatsPanel";
import { AllocationTable } from "@/components/simulator/AllocationTable";
import { PipelineDiagram } from "@/components/simulator/PipelineDiagram";
import { FragmentationChart } from "@/components/simulator/charts/FragmentationChart";
import { UtilizationChart } from "@/components/simulator/charts/UtilizationChart";
import { CompareView } from "@/components/simulator/CompareView";

export function SimulatorView() {
  const comparison = useSimulationStore((s) => s.comparison);
  const timeline = useSimulationStore((s) => s.timeline);
  const status = useSimulationStore((s) => s.status);
  const error = useSimulationStore((s) => s.error);

  if (status === "error") {
    return (
      <div
        role="alert"
        className="panel border-danger/40 p-6 font-mono text-sm text-danger"
      >
        <span className="label !text-danger">error</span>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (comparison && comparison.length > 0 && timeline.length === 0) {
    return <CompareView />;
  }

  if (timeline.length === 0) {
    return <IdleState />;
  }

  return (
    <div className="space-y-5 rise">
      <Timeline />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <MemoryStrip />
        <StatsPanel />
      </div>
      <AllocationTable />
      <div className="grid gap-5 lg:grid-cols-2">
        <UtilizationChart />
        <FragmentationChart />
      </div>
      <PipelineDiagram />
    </div>
  );
}

function IdleState() {
  return (
    <div className="panel grid min-h-[480px] place-items-center p-10 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 flex w-fit items-center gap-3">
          <Glyph icon={<Boxes className="h-5 w-5 text-phosphor" />} />
          <Glyph icon={<MemoryStick className="h-5 w-5 text-signal" />} />
        </div>
        <h2 className="font-display text-xl font-bold text-fg">
          Ready to allocate.
        </h2>
        <p className="mt-2 text-sm text-muted">
          Configure a workload in the console, then{" "}
          <span className="text-signal">Run Simulation</span> to watch processes
          drop into memory step-by-step — or{" "}
          <span className="text-phosphor">Compare All</span> to rank First, Best,
          and Worst Fit side-by-side.
        </p>
        <p className="label mt-6">first fit · best fit · worst fit</p>
      </div>
    </div>
  );
}

function Glyph({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line2 bg-ink">
      {icon}
    </span>
  );
}
