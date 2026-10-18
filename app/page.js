"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const createRoom = useMutation(api.rooms.create);
  const verifyPassword = useMutation(api.rooms.verifyPassword);

  const [tab, setTab] = useState("join"); // "join" or "create"

  // Join Room State
  const [joinId, setJoinId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Create Room State
  const [createId, setCreateId] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function generateRandomRoom() {
    const words = ["alpha", "swift", "cozy", "pixel", "quiet", "zen", "cloud", "vault", "echo", "flow"];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setCreateId(`${word1}-${word2}-${num}`);
  }

  async function handleJoin(e) {
    if (e) e.preventDefault();
    const cleaned = joinId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleaned) {
      setJoinError("Please enter a room ID.");
      return;
    }
    const trimmedPwd = joinPassword.trim();
    if (!trimmedPwd) {
      setJoinError("Please enter the room password.");
      return;
    }

    setJoining(true);
    setJoinError("");
    try {
      const res = await verifyPassword({ roomId: cleaned, password: trimmedPwd });
      if (!res.valid) {
        setJoinError(res.reason === "Room does not exist" ? "Room does not exist." : "Incorrect password. Please try again.");
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`pastely_room_${cleaned}`, trimmedPwd);
      }
      router.push(`/${cleaned}`);
    } catch {
      setJoinError("Unable to verify room. Please check your connection.");
    } finally {
      setJoining(false);
    }
  }

  async function handleCreate(e) {
    if (e) e.preventDefault();
    const cleaned = createId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleaned || cleaned.length < 3) {
      setCreateError("Room ID must be at least 3 characters.");
      return;
    }
    const trimmedPwd = createPassword.trim();
    if (!trimmedPwd) {
      setCreateError("A room password is required.");
      return;
    }

    setCreateError("");
    setCreating(true);
    try {
      await createRoom({ roomId: cleaned, password: trimmedPwd });
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`pastely_room_${cleaned}`, trimmedPwd);
      }
      router.push(`/${cleaned}`);
    } catch (err) {
      setCreateError(err.message || "Failed to create room.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="font-poppins text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Pastely
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-zinc-500">
            Real-time cross-device pastebin. Permanent password-protected rooms with 5-minute temporary clips.
          </p>
        </div>

        {/* Room Card with Tabs */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">

          {/* Segmented Switcher */}
          <div className="mb-5 flex rounded-xl bg-zinc-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab("join");
                setJoinError("");
                setCreateError("");
              }}
              className={`flex-1 rounded-lg py-2 transition ${tab === "join"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
                }`}
            >
              Join Room
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("create");
                setJoinError("");
                setCreateError("");
              }}
              className={`flex-1 rounded-lg py-2 transition ${tab === "create"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
                }`}
            >
              Create Room
            </button>
          </div>

          {/* Tab 1: Join Room */}
          {tab === "join" && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="join-room-id" className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Room ID
                </label>
                <input
                  id="join-room-id"
                  type="text"
                  value={joinId}
                  onChange={(e) => {
                    setJoinId(e.target.value);
                    if (joinError) setJoinError("");
                  }}
                  placeholder="Enter room ID"
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="join-password" className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Room Password
                </label>
                <div className="relative">
                  <input
                    id="join-password"
                    type={showJoinPassword ? "text" : "password"}
                    value={joinPassword}
                    onChange={(e) => {
                      setJoinPassword(e.target.value);
                      if (joinError) setJoinError("");
                    }}
                    placeholder="Enter room password"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJoinPassword(!showJoinPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                    aria-label={showJoinPassword ? "Hide password" : "Show password"}
                  >
                    {showJoinPassword ? (
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
              </div>

              {joinError && (
                <p className="text-xs font-medium text-rose-600 animate-pop-in">
                  {joinError}
                </p>
              )}

              <button
                type="submit"
                disabled={joining || !joinId.trim() || !joinPassword.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {joining ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Join Room</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Create Room */}
          {tab === "create" && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="create-room-id" className="text-xs font-medium text-zinc-600">
                    Room ID
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomRoom}
                    className="text-[11px] font-medium text-zinc-400 hover:text-zinc-800"
                  >
                    🎲 Random
                  </button>
                </div>
                <input
                  id="create-room-id"
                  type="text"
                  value={createId}
                  onChange={(e) => {
                    setCreateId(e.target.value);
                    if (createError) setCreateError("");
                  }}
                  placeholder="Enter room ID"
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="create-password" className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Room Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="create-password"
                    type={showCreatePassword ? "text" : "password"}
                    value={createPassword}
                    onChange={(e) => {
                      setCreatePassword(e.target.value);
                      if (createError) setCreateError("");
                    }}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                    aria-label={showCreatePassword ? "Hide password" : "Show password"}
                  >
                    {showCreatePassword ? (
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
              </div>

              {createError && (
                <p className="text-xs font-medium text-rose-600 animate-pop-in">
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating || !createId.trim() || !createPassword.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </form>
          )}

        </div>

      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        <p>Pastely · Private and temporary clipboard pastebin</p>
      </footer>
    </div>
  );
}
