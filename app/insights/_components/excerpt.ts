export function excerpt(value: string, length: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > length ? cleaned.slice(0, length).trimEnd() + "…" : cleaned;
}
