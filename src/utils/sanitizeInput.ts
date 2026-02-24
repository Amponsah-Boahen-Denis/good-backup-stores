import sanitizeHtml from "sanitize-html";

export function sanitizeInput(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

export default sanitizeInput;


