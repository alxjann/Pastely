import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    password: v.string(),
    createdAt: v.number(),
  }).index("by_roomId", ["roomId"]),

  clips: defineTable({
    roomId: v.string(),
    kind: v.union(v.literal("text"), v.literal("file")),
    text: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_expiresAt", ["expiresAt"]),
});
