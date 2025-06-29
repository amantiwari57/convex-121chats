import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(), // This will be hashed
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  numbers: defineTable({
    value: v.number(),
  }),
  tasks: defineTable({
    user: v.string(),
    body: v.string(),
  }),
  chat: defineTable({
    userId: v.id("users"), // Reference to users table
    participants: v.array(v.id("users")), // Array of user IDs
    lastMessage: v.object({
      userId: v.id("users"),
      body: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_participant", ["userId"]),
  messages: defineTable({
    chat: v.id("chat"),
    body: v.string(),
    sender: v.id("users"), // Reference to users table
    createdAt: v.number(),
  }).index("by_chat", ["chat", "createdAt"]),
  chatInvites: defineTable({
    chatId: v.id("chat"),
    invitedBy: v.id("users"),
    invitedUser: v.id("users"),
    status: v.string(), // "pending", "accepted", "rejected"
    createdAt: v.number(),
  }).index("by_invited_user", ["invitedUser", "status"]),
});
