// Shared by the Convex backend and the Next.js frontend (single source of truth).

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_TEXT_CHARS = 20000;
export const EXPIRY_MS = 5 * 60 * 1000; // 300,000 ms

const ALLOWED_EXACT = new Set([
  "application/pdf",
  "application/json",
  "application/rtf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
]);

const BLOCKED_EXTENSIONS = [
  ".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm", ".wmv", ".flv", ".mpg", ".mpeg", ".3gp",
];

export function isVideo(mimeType = "", fileName = "") {
  const t = (mimeType || "").toLowerCase();
  const n = (fileName || "").toLowerCase();
  return t.startsWith("video/") || BLOCKED_EXTENSIONS.some((e) => n.endsWith(e));
}

/** Returns null when OK, otherwise a human readable error. */
export function validateMime(mimeType, fileName = "") {
  const t = (mimeType || "").toLowerCase().split(";")[0].trim();
  if (isVideo(t, fileName)) return "Video files are not allowed.";
  if (!t) return "Unknown file type.";
  if (t.startsWith("text/") || t.startsWith("image/") || ALLOWED_EXACT.has(t)) return null;
  return `File type "${t}" is not supported.`;
}

export const ACCEPT_ATTR =
  "image/*,text/*,application/pdf,application/json,application/rtf,application/zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.csv,.txt,.md";
