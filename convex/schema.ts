import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Store additional user info mapped to Clerk user IDs
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"])
   .index("by_email", ["email"]),

  numbers: defineTable({
    value: v.number(),
  }),
  tasks: defineTable({
    user: v.string(),
    body: v.string(),
  }),
  chat: defineTable({
    userId: v.string(), // Clerk user ID
    participants: v.array(v.string()), // Array of Clerk user IDs
    lastMessage: v.object({
      userId: v.string(), // Clerk user ID
      body: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(), // Clerk user ID
  }).index("by_participant", ["userId"]),
  messages: defineTable({
    chat: v.id("chat"),
    body: v.string(),
    sender: v.string(), // Clerk user ID
    createdAt: v.number(),
    readBy: v.optional(v.array(v.object({
      userId: v.string(), // Clerk user ID
      readAt: v.number(),
    }))),
  }).index("by_chat", ["chat", "createdAt"]),
  chatInvites: defineTable({
    chatId: v.id("chat"),
    invitedBy: v.string(), // Clerk user ID
    invitedUser: v.string(), // Clerk user ID
    status: v.string(), // "pending", "accepted", "rejected"
    createdAt: v.number(),
  }).index("by_invited_user", ["invitedUser", "status"]),
});
