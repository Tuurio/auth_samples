export function currentPeriod(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function estimateUnits(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function cleanTitle(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.slice(0, 72) || "New conversation";
}
