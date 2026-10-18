"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ClipboardApp from "@/components/ClipboardApp";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const rawRoomId = params?.roomId || "";
  const roomId = decodeURIComponent(rawRoomId).trim().toLowerCase();

  const roomInfo = useQuery(api.rooms.get, roomId ? { roomId } : "skip");
  const verifyPasswordMutation = useMutation(api.rooms.verifyPassword);

  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load existing saved password from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && roomId) {
      const stored = localStorage.getItem(`pastely_room_${roomId}`);
      if (stored) {
        setVerifiedPassword(stored);
      }
      localStorage.setItem("pastely_last_room", roomId);
    }
  }, [roomId]);

  // Reactive verification: if room exists and password in state, ensure it stays valid
  const authCheck = useQuery(
    api.rooms.verify,
    roomId && verifiedPassword ? { roomId, password: verifiedPassword } : "skip"
  );

  useEffect(() => {
    if (verifiedPassword && authCheck !== undefined) {
      if (!authCheck.valid) {
        setVerifiedPassword("");
        if (typeof window !== "undefined") {
          localStorage.removeItem(`pastely_room_${roomId}`);
        }
        setError("Password is no longer valid. Please re-enter.");
      }
    }
  }, [authCheck, verifiedPassword, roomId]);

  async function handleUnlock(e) {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setError("Please enter the room password.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      const result = await verifyPasswordMutation({ roomId, password: passwordInput.trim() });
      if (result.valid) {
        setVerifiedPassword(passwordInput.trim());
        if (typeof window !== "undefined") {
          localStorage.setItem(`pastely_room_${roomId}`, passwordInput.trim());
          localStorage.setItem("pastely_last_room", roomId);
        }
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Failed to verify password. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleCopyRoomLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // fallback
    }
  }

  const isUnlocked = Boolean(verifiedPassword && authCheck?.valid === true);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
        
        {/* 1. Loading State */}
        {roomInfo === undefined && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            <p className="mt-4 text-xs font-medium text-zinc-400">Loading room...</p>
          </div>
        )}

        {/* 2. Room Does NOT Exist */}
        {roomInfo && !roomInfo.exists && (
          <div className="mx-auto max-w-md py-8 text-center animate-pop-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm text-zinc-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="font-poppins text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Room does not exist
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-zinc-500">
              The room <span className="font-semibold text-zinc-800">{roomId}</span> does not exist.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* 3. Room Exists BUT Locked: Only show room password input field */}
        {roomInfo?.exists && !isUnlocked && (
          <div className="mx-auto max-w-sm py-8 text-center animate-pop-in">
            <div className="mb-6">
              <h1 className="font-poppins text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Pastely
              </h1>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{roomId}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Enter the room password to access clips.
              </p>
            </div>

            {/* Room Password Input Form */}
            <form onSubmit={handleUnlock} className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              <div className="relative">
                <input
                  id="room-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Room password"
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-3 pr-10 text-base text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <p className="mt-2 text-xs font-medium text-rose-600 animate-pop-in">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={checking || !passwordInput.trim()}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checking ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Room</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition">
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* 4. Room Exists AND Password Verified: Full Clipboard Workspace */}
        {roomInfo?.exists && isUnlocked && (
          <div className="animate-pop-in">
            {/* Room Header bar */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-poppins text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                  Pastely
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                  Real-time room pastebin. Clips expire after 5 minutes.
                </p>
              </div>

              {/* Room Controls: Copy Link */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyRoomLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
                  title="Copy room link to share"
                >
                  {copiedLink ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-700 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>{roomId}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Workspace */}
            <ClipboardApp roomId={roomId} password={verifiedPassword} />
          </div>
        )}

      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        <p>Pastely · Private and temporary clipboard pastebin</p>
      </footer>
    </div>
  );
}
