# Frontend — Memory Management Simulator UI

**Next.js 16** App Router front end that **replays** the event timeline returned by the
backend. It is purely presentational: it renders and animates frames, never recomputes
allocation.

## Tech stack

Next.js 16 · Tailwind CSS v4 · Shadcn UI + Radix · Magic UI · Motion (Framer) ·
GSAP + @gsap/react · React Flow · Recharts · Zustand

## Layout

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # composes the simulator
│   └── globals.css               # Tailwind v4 entry + theme tokens
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── magicui/                  # magic ui effects
│   └── simulator/
│       ├── ControlPanel.tsx      # inputs: blocks, processes, strategy, run
│       ├── MemoryStrip.tsx       # animated memory blocks (GSAP)
│       ├── Timeline.tsx          # play / pause / step / speed scrubber
│       ├── PipelineDiagram.tsx   # React Flow data-flow diagram
│       ├── AllocationTable.tsx   # shadcn table of placements
│       ├── StatsPanel.tsx        # live fragmentation / utilization
│       └── charts/
│           ├── FragmentationChart.tsx   # Recharts
│           └── UtilizationChart.tsx
├── store/simulationStore.ts      # Zustand: { timeline, cursor, speed, status }
├── hooks/useReplay.ts            # advances cursor on a speed-controlled interval
└── lib/
    ├── api.ts                    # fetch wrapper -> POST /simulate
    ├── types.ts                  # mirrors backend Pydantic contract
    └── animations.ts             # GSAP helpers (FLIP-style block transitions)
```

## Setup

The app is already scaffolded and wired up. Just install and run:

```bash
npm install
npm run dev        # http://localhost:3000
```

Installed libraries: `next`, `react`, `zustand`, `gsap` + `@gsap/react`,
`@xyflow/react` (React Flow), `recharts`, `motion`, `tailwindcss` v4, `lucide-react`,
plus `clsx`/`tailwind-merge`/`class-variance-authority` (shadcn-style helpers).
`components.json` is present so `npx shadcn@latest add <component>` works when you want
official shadcn primitives.

API base URL is read from `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run

```bash
npm install
npm run dev        # dev server with HMR
# or
npm run build && npm run start   # production build on :3000
```

The backend must be running on `:8000` (see `../backend/README.md`).

## Replay model

`simulationStore` holds the full `timeline` plus a `cursor`. `useReplay` ticks the
cursor forward; each `MemoryStrip` block animates from its previous frame to the
current one with GSAP, so allocation/deallocation reads as motion. Scrubbing the
`Timeline` just moves the cursor — no backend round-trip.

See the repo-root [`PLAN.md`](../PLAN.md) for the full plan and roadmap.
