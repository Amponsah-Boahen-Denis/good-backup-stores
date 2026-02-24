export function extractProductName(raw: string): string {
  if (!raw) return "";
  // Normalize whitespace, strip extra punctuations often typed by users
  const normalized = raw
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Remove common noise like quotes and trailing punctuation
  const cleaned = normalized.replace(/["'`]+/g, "").replace(/[.,;:!?]+$/g, "");
  return cleaned;
}

export default extractProductName;


