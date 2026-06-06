"use client";

import { runSimulation } from "@/lib/api";
import { useSimulationStore } from "@/store/simulationStore";
import type { OperationInput } from "@/lib/types";

/**
 * Mutating actions on the current run: free or (re)allocate a process. Each
 * appends an operation to the workload and re-runs the engine, so the timeline
 * grows with a real deallocate/allocate step and fragmentation updates live.
 */
export function useSimActions() {
  const config = useSimulationStore((s) => s.config);
  const setStatus = useSimulationStore((s) => s.setStatus);
  const setError = useSimulationStore((s) => s.setError);
  const setRerun = useSimulationStore((s) => s.setRerun);

  async function apply(op: OperationInput) {
    if (!config) return;
    const operations = [...config.operations, op];
    setStatus("loading");
    try {
      const res = await runSimulation({
        blocks: config.blocks,
        processes: config.processes,
        strategy: config.strategy,
        operations,
      });
      setRerun(res.strategy, res.timeline, { ...config, operations });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    }
  }

  return {
    canEdit: !!config,
    free: (name: string) => apply({ type: "deallocate", process: name }),
    allocate: (name: string) => apply({ type: "allocate", process: name }),
  };
}
