export function decodeJwt(token: string): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function formatUnixTime(unixSeconds: number | undefined) {
  if (!unixSeconds) return "unknown time";
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleString();
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = padded.length % 4;
  const base64 = padLength ? padded.padEnd(padded.length + (4 - padLength), "=") : padded;
  return atob(base64);
}
