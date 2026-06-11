/**
 * Body-weight tracking for BHT.
 *
 * Storage shape (KV):
 *   `weight:{tsMs}` → JSON { lb, ts, note, source }     (5y TTL)
 *   `weight_latest` → JSON { lb, ts }                    (no TTL)
 *   `weight_index`  → JSON number[] (last 200 tsMs, desc)(no TTL)
 *
 * Targets are env-configured:
 *   WEIGHT_TARGET_STRETCH  default '180'
 *   WEIGHT_TARGET_SETTLE   default '190'
 *
 * Auth: required env WEIGHT_KEY. Both log + read are auth-gated;
 * body weight is personal health data, not public.
 */

interface KV {
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  get: (key: string) => Promise<string | null>;
}

interface WeightEnv {
  KV: KV;
  WEIGHT_KEY?: string;
  WEIGHT_TARGET_STRETCH?: string;
  WEIGHT_TARGET_SETTLE?: string;
}

interface WeightEntry {
  lb: number;
  ts: number;
  note: string | null;
  source: 'manual' | 'garmin-scale' | 'other';
}

interface WeightStatus {
  latest: { lb: number; ts: number } | null;
  targets: { stretch: number; settle: number };
  delta_to_settle: number | null;
  delta_to_stretch: number | null;
  trend_7d: number | null;
  trend_30d: number | null;
  last_log_ago_hours: number | null;
  recent_count: number;
}

const FIVE_YEARS_SECONDS = 60 * 60 * 24 * 365 * 5;
const INDEX_CAP = 200;

function parseTargetEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

export function isWeightAuth(authHeader: string | null | undefined, env: WeightEnv): boolean {
  if (!env.WEIGHT_KEY) return false;
  const token = (authHeader ?? '').replace(/^Bearer\s+/i, '');
  return token === env.WEIGHT_KEY;
}

export function isWeightEnabled(env: WeightEnv): boolean {
  return Boolean(env.WEIGHT_KEY);
}

export function validateLb(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  // Human body weight bounds. Reject obviously bad inputs.
  if (value < 50 || value > 500) return null;
  return value;
}

export function validateNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  return value.slice(0, 240);
}

export function parseTsOverride(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
    const asNum = parseInt(value, 10);
    if (Number.isFinite(asNum) && asNum > 0) return asNum;
  }
  return null;
}

export async function logWeight(
  env: WeightEnv,
  lb: number,
  note: string | null,
  tsOverride: number | null,
): Promise<{ ts: number; lb: number }> {
  const ts = tsOverride ?? Date.now();
  const entry: WeightEntry = { lb, ts, note, source: 'manual' };
  await env.KV.put(`weight:${ts}`, JSON.stringify(entry), { expirationTtl: FIVE_YEARS_SECONDS });
  await env.KV.put('weight_latest', JSON.stringify({ lb, ts }));

  const idxRaw = await env.KV.get('weight_index');
  let idx: number[] = [];
  try {
    idx = idxRaw ? JSON.parse(idxRaw) : [];
    if (!Array.isArray(idx)) idx = [];
  } catch {
    idx = [];
  }
  idx.unshift(ts);
  idx.sort((a, b) => b - a);
  await env.KV.put('weight_index', JSON.stringify(idx.slice(0, INDEX_CAP)));

  return { ts, lb };
}

async function loadEntriesSince(env: WeightEnv, sinceMs: number): Promise<WeightEntry[]> {
  const idxRaw = await env.KV.get('weight_index');
  let idx: number[] = [];
  try {
    idx = idxRaw ? JSON.parse(idxRaw) : [];
    if (!Array.isArray(idx)) idx = [];
  } catch {
    return [];
  }
  const tsInWindow = idx.filter((ts) => ts >= sinceMs);
  const entries: WeightEntry[] = [];
  for (const ts of tsInWindow) {
    const raw = await env.KV.get(`weight:${ts}`);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as WeightEntry;
      if (typeof parsed.lb === 'number') entries.push(parsed);
    } catch {
      /* skip corrupt */
    }
  }
  return entries.sort((a, b) => a.ts - b.ts);
}

function trendBetween(entries: WeightEntry[]): number | null {
  if (entries.length < 2) return null;
  const first = entries[0]!;
  const last = entries[entries.length - 1]!;
  return Number((last.lb - first.lb).toFixed(2));
}

export async function getWeightStatus(env: WeightEnv): Promise<WeightStatus> {
  const stretch = parseTargetEnv(env.WEIGHT_TARGET_STRETCH, 180);
  const settle = parseTargetEnv(env.WEIGHT_TARGET_SETTLE, 190);

  const latestRaw = await env.KV.get('weight_latest');
  let latest: { lb: number; ts: number } | null = null;
  if (latestRaw) {
    try {
      latest = JSON.parse(latestRaw);
    } catch {
      latest = null;
    }
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const window30 = await loadEntriesSince(env, thirtyDaysAgo);
  const window7 = window30.filter((e) => e.ts >= sevenDaysAgo);

  return {
    latest,
    targets: { stretch, settle },
    delta_to_settle: latest ? Number((latest.lb - settle).toFixed(2)) : null,
    delta_to_stretch: latest ? Number((latest.lb - stretch).toFixed(2)) : null,
    trend_7d: trendBetween(window7),
    trend_30d: trendBetween(window30),
    last_log_ago_hours: latest ? Math.round((now - latest.ts) / 3600000) : null,
    recent_count: window30.length,
  };
}
