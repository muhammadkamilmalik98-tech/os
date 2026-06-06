"use client";

import { Plus, Trash2 } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useSimActions } from "@/hooks/useSimActions";
import type { BlockState } from "@/lib/types";

interface Row {
  name: string;
  size: number | null;
  block: BlockState | null;
}

export function AllocationTable() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);
  const config = useSimulationStore((s) => s.config);
  const status = useSimulationStore((s) => s.status);
  const { canEdit, free, allocate } = useSimActions();

  const frame = timeline[cursor];
  if (!frame) return null;

  const ownerOf = new Map<string, BlockState>();
  frame.blocks.forEach((b) => {
    if (b.allocated && b.ownerProcessName) ownerOf.set(b.ownerProcessName, b);
  });

  let rows: Row[];
  if (config) {
    rows = config.processes.map((p) => ({
      name: p.name,
      size: p.size,
      block: ownerOf.get(p.name) ?? null,
    }));
  } else {
    const seen = new Map<string, number | null>();
    frame.blocks.forEach((b) => {
      if (b.allocated && b.ownerProcessName) {
        seen.set(b.ownerProcessName, b.size - b.internalFragmentation);
      }
    });
    frame.unallocated.forEach((n) => {
      if (!seen.has(n)) seen.set(n, null);
    });
    rows = [...seen.entries()].map(([name, size]) => ({
      name,
      size,
      block: ownerOf.get(name) ?? null,
    }));
  }

  const busy = status === "loading";

  return (
    <section className="panel overflow-x-auto">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="label !text-muted">Allocation table</span>
        {canEdit && (
          <span className="label">free / allocate to edit memory</span>
        )}
      </div>

      <table className="w-full min-w-[620px] border-collapse text-sm">
        <thead>
          <tr className="text-left">
            {["Process", "Size", "Block", "Block size", "Int. frag", "Status", ""].map(
              (h) => (
                <th key={h} className="label px-4 py-2.5">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const allocated = !!r.block;
            return (
              <tr key={r.name} className="border-t border-line font-mono">
                <Td className="font-display text-sm font-semibold text-fg">
                  {r.name}
                </Td>
                <Td>{r.size ?? "—"}</Td>
                <Td>{allocated ? `blk${r.block!.id}` : "—"}</Td>
                <Td>{allocated ? r.block!.size : "—"}</Td>
                <Td className={allocated ? "text-signal" : ""}>
                  {allocated ? r.block!.internalFragmentation : "—"}
                </Td>
                <Td>
                  {allocated ? (
                    <span className="rounded-md border border-phosphor/40 bg-phosphor/10 px-2 py-0.5 text-xs text-phosphor">
                      allocated
                    </span>
                  ) : (
                    <span className="rounded-md border border-danger/40 bg-danger/10 px-2 py-0.5 text-xs text-danger">
                      unallocated
                    </span>
                  )}
                </Td>
                <Td>
                  {canEdit &&
                    (allocated ? (
                      <button
                        onClick={() => free(r.name)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-md border border-line2 bg-ink px-2.5 py-1 text-xs text-muted transition hover:border-danger hover:text-danger disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" /> Free
                      </button>
                    ) : (
                      <button
                        onClick={() => allocate(r.name)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-md border border-line2 bg-ink px-2.5 py-1 text-xs text-muted transition hover:border-phosphor hover:text-phosphor disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" /> Allocate
                      </button>
                    ))}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
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
