"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSimulationStore } from "@/store/simulationStore";
import { BorderBeam } from "@/components/magicui/BorderBeam";
import type { BlockState } from "@/lib/types";

const hex = (n: number) => "0x" + n.toString(16).toUpperCase().padStart(4, "0");
const sizeFromMessage = (msg: string) => {
  const m = msg.match(/\((\d+)\)/);
  return m ? Number(m[1]) : null;
};

export function MemoryStrip() {
  const timeline = useSimulationStore((s) => s.timeline);
  const cursor = useSimulationStore((s) => s.cursor);
  const frame = timeline[cursor];
  const targetBlockId = frame?.targetBlockId ?? null;
  const containerRef = useRef<HTMLDivElement>(null);

  // Rejected-but-fitting candidates: free blocks (before this step) that could
  // also have held the process, but the strategy didn't pick. Maps id -> leftover.
  const candidates = new Map<number, number>();
  if (
    frame &&
    (frame.type === "allocate" || frame.type === "allocate_failed")
  ) {
    const procSize = sizeFromMessage(frame.message);
    const prev = cursor > 0 ? timeline[cursor - 1] : undefined;
    if (procSize != null && prev) {
      prev.blocks.forEach((b) => {
        if (!b.allocated && b.size >= procSize && b.id !== targetBlockId) {
          candidates.set(b.id, b.size - procSize);
        }
      });
    }
  }

  useGSAP(
    () => {
      if (!frame) return;
      gsap.from(".lane", {
        opacity: 0,
        x: -14,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
      });
    },
    { scope: containerRef, dependencies: [timeline.length] },
  );

  useGSAP(
    () => {
      if (targetBlockId == null || !containerRef.current) return;
      const el = containerRef.current.querySelector(
        `[data-block="${targetBlockId}"]`,
      );
      if (el) {
        gsap.fromTo(
          el,
          { scale: 0.985 },
          { scale: 1, duration: 0.5, ease: "back.out(2.4)" },
        );
      }
    },
    { scope: containerRef, dependencies: [cursor] },
  );

  if (!frame) {
    return (
      <div className="panel grid min-h-72 place-items-center text-sm text-faint">
        <span className="label">awaiting run</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[15px] p-px">
      <BorderBeam duration={7} />
      <section
        ref={containerRef}
        className="relative rounded-[14px] border border-line bg-surface"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="label !text-muted">Physical Memory</span>
          <span className="label">
            {frame.blocks.length} partitions · {frame.metrics.total} units
          </span>
        </div>

        <div className="space-y-2 p-5">
          {frame.blocks.map((block) => (
            <Lane
              key={block.id}
              block={block}
              highlighted={block.id === targetBlockId}
              candidateLeftover={candidates.get(block.id) ?? null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Lane({
  block,
  highlighted,
  candidateLeftover,
}: {
  block: BlockState;
  highlighted: boolean;
  candidateLeftover: number | null;
}) {
  const usedUnits = block.size - block.internalFragmentation;
  const usedPct = block.allocated ? (usedUnits / block.size) * 100 : 0;
  const isCandidate = !block.allocated && candidateLeftover != null;

  return (
    <div
      data-block={block.id}
      className={
        "lane grid grid-cols-[78px_minmax(0,1fr)_120px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors " +
        (highlighted
          ? "border-signal/70 bg-signal/[0.07]"
          : isCandidate
            ? "border-dashed border-signal/45 bg-signal/[0.03]"
            : "border-line bg-ink/40")
      }
    >
      {/* address */}
      <div className="font-mono text-[11px] leading-tight text-faint">
        <div className="text-muted">{hex(block.start)}</div>
        <div>blk{block.id}</div>
      </div>

      {/* bar */}
      <div className="relative h-9 overflow-hidden rounded-lg border border-line bg-ink">
        {block.allocated ? (
          <>
            <div
              className="h-full bg-gradient-to-r from-phosphor/90 to-phosphor/60 transition-[width] duration-500 ease-out"
              style={{ width: `${usedPct}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-[repeating-linear-gradient(45deg,rgba(255,178,36,0.55)_0_6px,rgba(255,178,36,0.2)_6px_12px)] transition-[width] duration-500 ease-out"
              style={{ width: `${100 - usedPct}%` }}
              title={`internal fragmentation ${block.internalFragmentation}`}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center px-3">
              <span className="font-mono text-[11px] font-semibold text-ink/90 mix-blend-screen">
                {block.ownerProcessName}
              </span>
            </div>
          </>
        ) : (
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0_8px,transparent_8px_16px)]" />
        )}

        {highlighted && (
          <div className="scan pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        )}
      </div>

      {/* readout */}
      <div className="text-right font-mono text-[11px] leading-tight">
        <div className="text-muted">
          {block.size}
          <span className="text-faint"> u</span>
        </div>
        {block.allocated ? (
          <div className="text-signal">frag {block.internalFragmentation}</div>
        ) : isCandidate ? (
          <div className="text-signal/80">could fit · +{candidateLeftover}</div>
        ) : (
          <div className="text-faint">free</div>
        )}
      </div>
    </div>
  );
}
