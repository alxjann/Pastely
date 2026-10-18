"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function useCountdown(expiresAt) {
  const [left, setLeft] = useState(Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const s = Math.ceil(left / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function formatSize(b = 0) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export default function ClipCard({ clip, roomId, password }) {
  const remove = useMutation(api.clips.remove);
  const timeLeft = useCountdown(clip.expiresAt);
  const [copied, setCopied] = useState(false);
  const isImage = clip.mimeType?.startsWith("image/");

  function flash() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(clip.text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = clip.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    flash();
  }

  async function copyImage() {
    try {
      const blob = await (await fetch(clip.url)).blob();
      const png = blob.type === "image/png" ? blob : await convertToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      flash();
    } catch {
      window.open(clip.url, "_blank");
    }
  }

  return (
    <article className="animate-pop-in rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:border-zinc-300 sm:p-6">
      <div className="mb-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden text-zinc-600 font-medium">
          {clip.kind === "text" ? (
            <span className="flex items-center gap-1.5 text-zinc-600 text-sm">
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Text snippet
            </span>
          ) : isImage ? (
            <span className="flex max-w-[220px] items-center gap-1.5 truncate text-zinc-700 sm:max-w-sm text-sm">
              <svg className="h-4 w-4 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{clip.fileName}</span>
            </span>
          ) : (
            <span className="flex max-w-[220px] items-center gap-1.5 truncate text-zinc-700 sm:max-w-sm text-sm">
              <svg className="h-4 w-4 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">{clip.fileName}</span>
            </span>
          )}
        </div>

        <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-zinc-500">
          {timeLeft}
        </span>
      </div>

      {clip.kind === "text" && (
        <div className="mb-4 max-h-56 overflow-auto rounded-xl border border-zinc-200/90 bg-zinc-50/40 p-4 text-sm text-zinc-900 leading-relaxed font-normal">
          <p className="whitespace-pre-wrap break-words">{clip.text}</p>
        </div>
      )}

      {clip.kind === "file" && isImage && clip.url && (
        <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-1">
          <img
            src={clip.url}
            alt={clip.fileName || "Uploaded image"}
            className="max-h-72 w-full rounded-lg object-contain sm:max-h-80"
            loading="lazy"
          />
        </div>
      )}

      {clip.kind === "file" && !isImage && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-800 sm:text-sm">
              {clip.fileName}
            </p>
            <p className="text-[11px] text-zinc-400">
              {formatSize(clip.size)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {clip.kind === "text" && (
          <button
            type="button"
            onClick={copyText}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition active:scale-95 ${copied
              ? "bg-emerald-600 text-white"
              : "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800"
              }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        )}

        {clip.kind === "file" && isImage && (
          <button
            type="button"
            onClick={copyImage}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition active:scale-95 ${copied
              ? "bg-emerald-600 text-white"
              : "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800"
              }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied Image</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Copy Image</span>
              </>
            )}
          </button>
        )}

        {clip.kind === "file" && clip.url && (
          <a
            href={clip.url}
            download={clip.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition active:scale-95 ${isImage
              ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              : "bg-zinc-900 border-transparent text-white hover:bg-zinc-800"
              }`}
          >
            <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => remove({ roomId, password, id: clip._id })}
          aria-label="Delete item"
          className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition hover:border-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </article>
  );
}

async function convertToPng(blob) {
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  canvas.getContext("2d").drawImage(bmp, 0, 0);
  return await new Promise((res) => canvas.toBlob(res, "image/png"));
}
