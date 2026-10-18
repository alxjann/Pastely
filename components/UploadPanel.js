"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ACCEPT_ATTR, MAX_FILE_BYTES, MAX_TEXT_CHARS, validateMime } from "@/convex/lib/mime";

export default function UploadPanel({ roomId, password }) {
  const addText = useMutation(api.clips.addText);
  const generateUploadUrl = useMutation(api.clips.generateUploadUrl);
  const addFile = useMutation(api.clips.addFile);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const photoRef = useRef(null);

  async function sendText() {
    if (!text.trim()) return;
    setError("");
    setBusy(true);
    try {
      await addText({ roomId, password, text });
      setText("");
    } catch (e) {
      setError(cleanError(e));
    } finally {
      setBusy(false);
    }
  }

  async function pasteFromClipboard() {
    try {
      const items = await navigator.clipboard.read();
      const files = [];
      let pastedText = "";
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith("image/"));
        if (imgType) {
          const blob = await item.getType(imgType);
          files.push(
            new File([blob], `pasted-${Date.now()}.${imgType.split("/")[1]}`, { type: imgType })
          );
        } else if (item.types.includes("text/plain")) {
          pastedText = await (await item.getType("text/plain")).text();
        }
      }
      if (files.length) await uploadFiles(files);
      else if (pastedText) setText(pastedText);
    } catch {
      try {
        setText(await navigator.clipboard.readText());
      } catch {
        setError("Clipboard access denied. Press Ctrl+V or long-press and Paste instead.");
      }
    }
  }

  // Global paste (Ctrl+V of files/screenshots)
  useEffect(() => {
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (!files.length) return; // plain text pastes into the textarea as usual
      e.preventDefault();
      uploadFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  });

  async function uploadFiles(fileList) {
    setError("");
    setBusy(true);
    try {
      for (const file of Array.from(fileList)) {
        // Frontend validation (backend re-validates).
        const err =
          validateMime(file.type, file.name) ??
          (file.size > MAX_FILE_BYTES ? "File is too large (max 20 MB)." : null);
        if (err) {
          setError(`${file.name}: ${err}`);
          continue;
        }
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed.");
        const { storageId } = await res.json();
        await addFile({ roomId, password, storageId, fileName: file.name });
      }
    } catch (e) {
      setError(cleanError(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  return (
    <section aria-label="Send clip" className="relative">

      <div className="relative rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all">
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_TEXT_CHARS}
          rows={3}
          placeholder="Paste or type text, links, or files"
          className="w-full resize-none bg-transparent p-5 sm:p-6 pb-2 sm:pb-2 text-base text-zinc-900 placeholder:text-zinc-400 outline-none"
        />

        <div className="flex items-center justify-between px-5 pb-4 pt-1 sm:px-6 sm:pb-5">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              id="paste-btn"
              type="button"
              onClick={pasteFromClipboard}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 transition hover:text-zinc-900 active:scale-95"
            >
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Paste
            </button>

            <button
              id="photo-btn"
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 transition hover:text-zinc-900 active:scale-95 disabled:opacity-40"
            >
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo
            </button>

            <button
              id="file-btn"
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 transition hover:text-zinc-900 active:scale-95 disabled:opacity-40"
            >
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              File
            </button>
          </div>

          <button
            id="send-text-btn"
            type="button"
            onClick={sendText}
            disabled={busy || !text.trim()}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-white transition active:scale-95 ${busy || !text.trim()
                ? "bg-zinc-400 cursor-not-allowed opacity-90"
                : "bg-zinc-900 hover:bg-zinc-800 shadow-sm"
              }`}
          >
            Send
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        hidden
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {busy && (
        <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
          <svg className="h-3.5 w-3.5 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Pasting...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-xs text-rose-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-2 font-bold text-rose-500 hover:text-rose-700"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}

function cleanError(e) {
  const m = e?.message || "Something went wrong.";
  const match = m.match(/Uncaught Error: (.*?)(?:\n|$)/);
  return match ? match[1] : m;
}
