import type {
  CompareRequest,
  CompareResponse,
  SimulateRequest,
  SimulateResponse,
  StrategyInfo,
} from "@/lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map((d: { msg?: string }) => d.msg ?? "Invalid input")
        .join("; ");
    }
  } catch {
    /* fall through */
  }
  return `Request failed (${res.status}).`;
}

export async function fetchStrategies(): Promise<StrategyInfo[]> {
  const res = await fetch(`${API_URL}/strategies`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function runSimulation(
  request: SimulateRequest,
): Promise<SimulateResponse> {
  const res = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function runComparison(
  request: CompareRequest,
): Promise<CompareResponse> {
  const res = await fetch(`${API_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
