import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { EXPIRY_MS, MAX_FILE_BYTES, MAX_TEXT_CHARS, validateMime } from "./lib/mime";

/** Live list of clips; Convex pushes updates over WebSocket to every client. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const clips = await ctx.db.query("clips").order("desc").collect();
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
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error("Text is empty.");
    if (trimmed.length > MAX_TEXT_CHARS) throw new Error("Text is too long.");
    const id = await ctx.db.insert("clips", {
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
  args: { storageId: v.id("_storage"), fileName: v.string() },
  handler: async (ctx, { storageId, fileName }) => {
    const meta = await ctx.db.system.get(storageId);
    if (!meta) throw new Error("Upload not found.");

    const error =
      validateMime(meta.contentType, fileName) ??
      (meta.size > MAX_FILE_BYTES ? "File is too large (max 20 MB)." : null);
    if (error) {
      await ctx.storage.delete(storageId); // never keep rejected uploads
      throw new Error(error);
    }

    const id = await ctx.db.insert("clips", {
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
    if (!clip) return; // already removed manually
    if (clip.storageId) await ctx.storage.delete(clip.storageId);
    await ctx.db.delete(id);
  },
});

/** Manual early delete from the UI. */
export const remove = mutation({
  args: { id: v.id("clips") },
  handler: async (ctx, { id }) => {
    const clip = await ctx.db.get(id);
    if (!clip) return;
    if (clip.storageId) await ctx.storage.delete(clip.storageId);
    await ctx.db.delete(id);
  },
});
