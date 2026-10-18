import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Check if a room exists. Never leaks the password to the client. */
export const get = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    return room ? { exists: true, roomId: room.roomId } : { exists: false };
  },
});

/** Verify if the provided password matches the room (Query). */
export const verify = query({
  args: { roomId: v.string(), password: v.string() },
  handler: async (ctx, { roomId, password }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room) return { valid: false, reason: "Room does not exist" };
    return { valid: room.password === password };
  },
});

/** Verify password on submit (Mutation for instant response). */
export const verifyPassword = mutation({
  args: { roomId: v.string(), password: v.string() },
  handler: async (ctx, { roomId, password }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room) return { valid: false, reason: "Room does not exist" };
    return { valid: room.password === password };
  },
});

/** Permanently creates a new room with a room ID and password. */
export const create = mutation({
  args: { roomId: v.string(), password: v.string() },
  handler: async (ctx, { roomId, password }) => {
    const cleaned = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleaned || cleaned.length < 3) {
      throw new Error("Room ID must be at least 3 characters (letters, numbers, hyphens).");
    }
    const trimmedPwd = password.trim();
    if (!trimmedPwd) {
      throw new Error("Room password cannot be empty.");
    }
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (existing) {
      throw new Error(`Room "${cleaned}" already exists. Please choose a different name.`);
    }
    await ctx.db.insert("rooms", {
      roomId: cleaned,
      password: trimmedPwd,
      createdAt: Date.now(),
    });
    return { roomId: cleaned };
  },
});
