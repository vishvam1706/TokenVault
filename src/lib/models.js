/**
 * Hardcoded Antigravity AI model list.
 * These are the exact models available on the platform — not user-defined.
 */
export const MODELS = [
  { key: "gemini-3-1-pro-high", label: "Gemini 3.1 Pro (High)", badge: null },
  { key: "gemini-3-1-pro-low", label: "Gemini 3.1 Pro (Low)", badge: null },
  { key: "gemini-3-flash", label: "Gemini 3 Flash", badge: null },
  { key: "gemini-3-5-flash-high", label: "Gemini 3.5 Flash (High)", badge: null },
  { key: "gemini-3-5-flash-medium", label: "Gemini 3.5 Flash (Medium)", badge: null },
  { key: "gemini-3-5-flash-low", label: "Gemini 3.5 Flash (Low)", badge: null },
  { key: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (Thinking)", badge: null },
  { key: "claude-opus-4-6", label: "Claude Opus 4.6 (Thinking)", badge: null },
  { key: "gpt-oss-120b", label: "GPT-OSS 120B (Medium)", badge: null },
];

export const DEFAULT_MODEL = "claude-sonnet-4-6";

/** Status thresholds in milliseconds */
export const STATUS = {
  EXHAUSTED_THRESHOLD: 6 * 60 * 60 * 1000, // > 6 hours → exhausted
  SOON_THRESHOLD: 0,                         // < 6h && > 0 → soon
};

/**
 * Compute a model's status from its resetAt timestamp.
 * @param {Date|string} resetAt
 * @returns {"available"|"soon"|"exhausted"}
 */
export function getModelStatus(resetAt) {
  const remaining = new Date(resetAt).getTime() - Date.now();
  if (remaining <= 0) return "available";
  if (remaining < STATUS.EXHAUSTED_THRESHOLD) return "soon";
  return "exhausted";
}

/**
 * Format milliseconds as D : HH : MM : SS
 * @param {number} ms
 * @returns {string}
 */
export function formatCountdown(ms) {
  if (ms <= 0) return "0 : 00 : 00 : 00";
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${d} : ${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
}
