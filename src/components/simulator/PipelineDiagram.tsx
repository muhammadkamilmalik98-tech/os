"use client";

import { useMemo } from "react";
import {
  Background,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useSimulationStore } from "@/store/simulationStore";
import type { TimelineEvent } from "@/lib/types";

const PHOSPHOR = "#3ddc97";
const SIGNAL = "#ffb224";
const DANGER = "#ff5d73";
const CYAN = "#4cc9f0";
const LINE = "#2a3040";

function nodeStyle(border: string, bg = "#12151e"): React.CSSProperties {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 10,
    color: "#e8eaf2",
    padding: "6px 10px",
    width: 150,
    textAlign: "center",
  };
}

function sizeFromMessage(msg: string): number | null {
  const m = msg.match(/\((\d+)\)/);
  return m ? Number(m[1]) : null;
}

function ruleText(strategy: string): { label: string; rule: string } {
  if (strategy === "best_fit")
    return { label: "Best Fit", rule: "free block with the smallest leftover" };
  if (strategy === "worst_fit")
    return { label: "Worst Fit", rule: "free block with the largest leftover" };
  return {
    label: "First Fit",
    rule: "first free block large enough (lowest address)",
  };
}

interface Built {
  nodes: Node[];
  edges: Edge[];
  caption: string;
}

function build(
  frame: TimelineEvent | undefined,
  prev: TimelineEvent | undefined,
  strategy: string,
): Built {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const { label, rule } = ruleText(strategy);
  const Y = 96;

  if (!frame) return { nodes, edges, caption: "" };

  // ---- INIT ----
  if (frame.type === "init") {
    nodes.push({
      id: "init",
      position: { x: 240, y: Y },
      data: {
        label: (
          <div className="leading-tight">
            <div className="font-display font-semibold text-fg">
              {frame.blocks.length} partitions
            </div>
            <div className="text-[10px] text-muted">
              {frame.metrics.total} units · all free
            </div>
          </div>
        ),
      },
      style: nodeStyle(LINE),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
    return {
      nodes,
      edges,
      caption: `Memory initialized — ${label} ready to allocate.`,
    };
  }

  // ---- DEALLOCATE ----
  if (frame.type === "deallocate") {
    const id = frame.targetBlockId;
    nodes.push(
      {
        id: "proc",
        position: { x: 0, y: Y },
        data: {
          label: (
            <div className="leading-tight">
              <div className="font-display font-semibold text-cyan">
                {frame.targetProcess}
              </div>
              <div className="text-[10px] text-muted">released</div>
            </div>
          ),
        },
        style: nodeStyle(CYAN),
        sourcePosition: Position.Right,
      },
      {
        id: "blk",
        position: { x: 250, y: Y },
        data: {
          label: (
            <div className="font-display font-semibold text-fg">blk{id}</div>
          ),
        },
        style: nodeStyle(LINE),
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "pool",
        position: { x: 500, y: Y },
        data: {
          label: <div className="font-mono text-xs text-phosphor">free pool</div>,
        },
        style: nodeStyle(PHOSPHOR, "rgba(61,220,151,0.08)"),
        targetPosition: Position.Left,
      },
    );
    edges.push(
      { id: "e1", source: "proc", target: "blk", animated: true, style: { stroke: CYAN } },
      { id: "e2", source: "blk", target: "pool", animated: true, style: { stroke: PHOSPHOR } },
    );
    return {
      nodes,
      edges,
      caption: `${frame.targetProcess} freed from blk${id} → memory returned to the free pool.`,
    };
  }

  // ---- ALLOCATE / ALLOCATE_FAILED ----
  const procSize = sizeFromMessage(frame.message);
  const name = frame.targetProcess ?? "P?";
  const targetId = frame.targetBlockId;
  const ok = frame.type === "allocate";

  // candidates = blocks that were FREE just before this step
  const candidates = (prev?.blocks ?? []).filter((b) => !b.allocated);
  const n = Math.max(candidates.length, 1);
  const gap = 66;
  const top = Y - ((n - 1) * gap) / 2;

  nodes.push({
    id: "proc",
    position: { x: 0, y: Y },
    data: {
      label: (
        <div className="leading-tight">
          <div className="font-display font-semibold text-signal">{name}</div>
          <div className="text-[10px] text-muted">
            needs {procSize ?? "?"} u
          </div>
        </div>
      ),
    },
    style: nodeStyle(SIGNAL),
    sourcePosition: Position.Right,
  });

  candidates.forEach((b, i) => {
    const fits = procSize != null && b.size >= procSize;
    const leftover = procSize != null ? b.size - procSize : null;
    const winner = b.id === targetId;
    nodes.push({
      id: `c${b.id}`,
      position: { x: 250, y: top + i * gap },
      data: {
        label: (
          <div className="leading-tight">
            <div className="font-display text-xs font-semibold text-fg">
              blk{b.id} · {b.size}u
            </div>
            <div
              className={
                "text-[10px] " +
                (fits
                  ? winner
                    ? "text-phosphor"
                    : "text-muted"
                  : "text-danger")
              }
            >
              {fits ? `leftover ${leftover}` : "✗ too small"}
              {winner ? "  ◀ pick" : ""}
            </div>
          </div>
        ),
      },
      style: nodeStyle(
        winner ? PHOSPHOR : fits ? LINE : "#5a2a33",
        winner ? "rgba(61,220,151,0.10)" : "#12151e",
      ),
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    edges.push({
      id: `ep${b.id}`,
      source: "proc",
      target: `c${b.id}`,
      animated: winner,
      style: {
        stroke: winner ? PHOSPHOR : fits ? LINE : "#3a2030",
        opacity: fits ? 1 : 0.5,
      },
    });
    if (winner) {
      edges.push({
        id: `er${b.id}`,
        source: `c${b.id}`,
        target: "res",
        animated: true,
        style: { stroke: SIGNAL },
      });
    }
  });

  const targetFrag =
    frame.blocks.find((b) => b.id === targetId)?.internalFragmentation ?? 0;

  nodes.push({
    id: "res",
    position: { x: 520, y: Y },
    data: {
      label: ok ? (
        <div className="leading-tight">
          <div className="font-display font-semibold text-phosphor">
            → blk{targetId}
          </div>
          <div className="text-[10px] text-muted">internal frag {targetFrag}</div>
        </div>
      ) : (
        <div className="font-display text-xs font-semibold text-danger">
          ✗ unallocated
        </div>
      ),
    },
    style: nodeStyle(ok ? PHOSPHOR : DANGER, ok ? "rgba(61,220,151,0.08)" : "rgba(255,93,115,0.08)"),
    targetPosition: Position.Left,
  });

  if (!ok) {
    edges.push({
      id: "efail",
      source: "proc",
      target: "res",
      style: { stroke: DANGER, strokeDasharray: "4 4" },
    });
  }

  const caption = ok
    ? `${name} (${procSize}) → blk${targetId}, leftover ${targetFrag}. ${label}: ${rule}.`
    : `${name} (${procSize}) does not fit any free block → unallocated. ${label}: ${rule}.`;

  return { nodes, edges, caption };
}

export function PipelineDiagram() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);
  const strategy = useSimulationStore((s) => s.strategy);

  const frame = timeline[cursor];
  const prev = cursor > 0 ? timeline[cursor - 1] : undefined;

  const { nodes, edges, caption } = useMemo(
    () => build(frame, prev, strategy),
    [frame, prev, strategy],
  );

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="label !text-muted">Allocation decision · this step</span>
        <span className="font-mono text-[11px] text-faint">
          process → free blocks → pick → result
        </span>
      </div>

      <div className="mt-3 h-[230px] w-full overflow-hidden rounded-xl border border-line bg-ink">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1b1f29" gap={20} />
        </ReactFlow>
      </div>

      {caption && (
        <p className="mt-3 font-mono text-[12px] text-fg/80">
          <span className="text-faint">›</span> {caption}
        </p>
      )}
    </section>
  );
}
