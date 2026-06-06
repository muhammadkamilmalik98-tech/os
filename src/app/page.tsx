import { Cpu } from "lucide-react";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { SimulatorView } from "@/components/simulator/SimulatorView";

export default function Home() {
  return (
    <div className="relative z-10 min-h-screen">
      <TopBar />

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-6 md:px-6">
        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-[84px]">
            <ControlPanel />
          </aside>
          <div className="min-w-0">
            <SimulatorView />
          </div>
        </div>
      </div>

      <footer className="mx-auto max-w-[1440px] px-4 pb-10 md:px-6">
        <p className="label">
          MEMVIZ · pure-OOP engine + FastAPI · Next.js replay · First / Best /
          Worst Fit
        </p>
      </footer>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-line2 bg-surface shadow-[0_0_24px_rgba(255,178,36,0.12)]">
            <Cpu className="h-5 w-5 text-signal" strokeWidth={1.6} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-[0.18em] text-fg">
              MEM<span className="text-signal">VIZ</span>
            </div>
            <div className="label">Memory Allocation Inspector</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-2 sm:flex">
            <Swatch color="bg-phosphor" label="used" />
            <Swatch color="bg-signal" label="frag" />
            <Swatch color="bg-line2" label="free" />
            <Swatch color="bg-danger" label="failed" />
          </div>
          <div className="flex items-center gap-2 border-l border-line pl-4">
            <span className="led inline-block h-2 w-2 rounded-full bg-phosphor shadow-[0_0_8px_var(--color-phosphor)]" />
            <span className="label !text-muted">System online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-[3px] ${color}`} />
      <span className="label">{label}</span>
    </span>
  );
}
