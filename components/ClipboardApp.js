"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UploadPanel from "./UploadPanel";
import ClipCard from "./ClipCard";

export default function ClipboardApp() {
  const clips = useQuery(api.clips.list); // live subscription over WebSocket

  return (
    <div className="space-y-6 sm:space-y-8">
      <UploadPanel />

      <section aria-label="Shared clipboard clips" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Active Clips
            </h2>
            {clips && clips.length > 0 && (
              <span className="inline-flex h-5 items-center rounded-full bg-zinc-100 px-2 text-[11px] font-semibold text-zinc-600">
                {clips.length}
              </span>
            )}
          </div>
        </div>

        {clips === undefined && (
          <div className="space-y-2.5">
            <div className="h-24 animate-pulse rounded-2xl border border-zinc-200/60 bg-white/60 p-4" />
            <div className="h-20 animate-pulse rounded-2xl border border-zinc-200/60 bg-white/40 p-4" />
          </div>
        )}

        {clips && clips.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-600">No active clips</p>
            <p className="mt-1 max-w-xs text-xs text-zinc-400">
              Copy or select text, photos, or files to immediately access them on other devices.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {clips?.map((clip) => (
            <ClipCard key={clip._id} clip={clip} />
          ))}
        </div>
      </section>
    </div>
  );
}
