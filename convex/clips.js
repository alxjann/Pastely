import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { EXPIRY_MS, MAX_FILE_BYTES, MAX_TEXT_CHARS, validateMime } from "./lib/mime";

/** Live list of clips in a specific room; requires matching room password. */
export const list = query({
  args: {
    roomId: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { roomId, password }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room || room.password !== password) {
      return null;
    }

    const clips = await ctx.db
      .query("clips")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .order("desc")
      .take(50);

    return await Promise.all(
      clips.map(async (c) => ({
        ...c,
        url: c.storageId ? await ctx.storage.getUrl(c.storageId) : null,
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const addText = mutation({
  args: {
    roomId: v.string(),
    password: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { roomId, password, text }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room || room.password !== password) {
      throw new Error("Unauthorized: Invalid room or password.");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new Error("Text is empty.");
    if (trimmed.length > MAX_TEXT_CHARS) throw new Error("Text is too long.");

    const id = await ctx.db.insert("clips", {
      roomId: cleaned,
      kind: "text",
      text: trimmed,
      expiresAt: Date.now() + EXPIRY_MS,
    });
    await ctx.scheduler.runAfter(EXPIRY_MS, internal.clips.destroy, { id });
    return id;
  },
});

/** Called after the browser uploaded the blob. Re-validates using the stored metadata. */
export const addFile = mutation({
  args: {
    roomId: v.string(),
    password: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, { roomId, password, storageId, fileName }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room || room.password !== password) {
      await ctx.storage.delete(storageId);
      throw new Error("Unauthorized: Invalid room or password.");
    }

    const meta = await ctx.db.system.get(storageId);
    if (!meta) throw new Error("Upload not found.");

    const error =
      validateMime(meta.contentType, fileName) ??
      (meta.size > MAX_FILE_BYTES ? "File is too large (max 20 MB)." : null);
    if (error) {
      await ctx.storage.delete(storageId);
      throw new Error(error);
    }

    const id = await ctx.db.insert("clips", {
      roomId: cleaned,
      kind: "file",
      storageId,
      fileName,
      mimeType: meta.contentType,
      size: meta.size,
      expiresAt: Date.now() + EXPIRY_MS,
    });
    await ctx.scheduler.runAfter(EXPIRY_MS, internal.clips.destroy, { id });
    return id;
  },
});

/** Scheduled exactly 300,000 ms after upload: removes storage blob + DB record. */
export const destroy = internalMutation({
  args: { id: v.id("clips") },
  handler: async (ctx, { id }) => {
    const clip = await ctx.db.get(id);
    if (!clip) return;
    if (clip.storageId) await ctx.storage.delete(clip.storageId);
    await ctx.db.delete(id);
  },
});

/** Manual early delete from the UI. */
export const remove = mutation({
  args: {
    roomId: v.string(),
    password: v.string(),
    id: v.id("clips"),
  },
  handler: async (ctx, { roomId, password, id }) => {
    const cleaned = roomId.trim().toLowerCase();
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", cleaned))
      .unique();
    if (!room || room.password !== password) {
      throw new Error("Unauthorized: Invalid room or password.");
    }

    const clip = await ctx.db.get(id);
    if (!clip || clip.roomId !== cleaned) return;
    if (clip.storageId) await ctx.storage.delete(clip.storageId);
    await ctx.db.delete(id);
  },
});
