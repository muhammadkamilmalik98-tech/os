// Mirrors the backend Pydantic contract (app/api/schemas/simulation.py).

export type StrategyKey = "first_fit" | "best_fit" | "worst_fit";

export interface StrategyInfo {
  key: string;
  label: string;
  description: string;
}

export interface BlockState {
  id: number;
  start: number;
  size: number;
  allocated: boolean;
  ownerProcessId: number | null;
  ownerProcessName: string | null;
  internalFragmentation: number;
}

export interface Metrics {
  total: number;
  used: number;
  occupied: number;
  free: number;
  internalFragmentation: number;
  externalFragmentation: number;
  utilization: number;
}

export type EventType =
  | "init"
  | "allocate"
  | "allocate_failed"
  | "deallocate";

export interface TimelineEvent {
  step: number;
  type: EventType;
  message: string;
  targetProcess: string | null;
  targetBlockId: number | null;
  blocks: BlockState[];
  metrics: Metrics;
  unallocated: string[];
}

export interface SimulateResponse {
  strategy: string;
  timeline: TimelineEvent[];
}

// ---- request ----
export interface BlockInput {
  size: number;
}

export interface ProcessInput {
  name: string;
  size: number;
}

export interface OperationInput {
  type: "allocate" | "deallocate";
  process: string;
}

export interface SimulateRequest {
  blocks: BlockInput[];
  processes: ProcessInput[];
  strategy: string;
  operations?: OperationInput[];
}

// ---- compare ----
export interface StrategySummary {
  utilization: number;
  internalFragmentation: number;
  externalFragmentation: number;
  used: number;
  free: number;
  placed: number;
  unallocated: number;
}

export interface CompareResult {
  strategy: string;
  label: string;
  summary: StrategySummary;
  timeline: TimelineEvent[];
}

export interface CompareResponse {
  processCount: number;
  results: CompareResult[];
}

export interface CompareRequest {
  blocks: BlockInput[];
  processes: ProcessInput[];
  operations?: OperationInput[];
  strategies?: string[];
}
