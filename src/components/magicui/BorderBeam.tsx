"use client";

/**
 * Animated border beam. Drop inside a `relative overflow-hidden` wrapper with
 * `p-px`; the real content sits in a sibling that covers the center, leaving a
 * thin animated ring visible.
 */
export function BorderBeam({ duration = 7 }: { duration?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[15px]">
      <div
        className="beam absolute left-1/2 top-1/2 h-[260%] w-[260%]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #3ddc97 30deg, #ffb224 75deg, transparent 120deg)",
          animationDuration: `${duration}s`,
        }}
      />
      <style jsx>{`
        .beam {
          animation-name: beam-spin;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform: translate(-50%, -50%) rotate(0deg);
          opacity: 0.55;
        }
        @keyframes beam-spin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
