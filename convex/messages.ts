import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    chat: v.id("chat"),
    sender: v.id("users"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      chat: args.chat,
      sender: args.sender,
      body: args.body,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.chat, {
      lastMessage: {
        userId: args.sender,
        body: args.body,
      },
      updatedAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: {
    chat: v.id("chat"),
    page: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chat))
      .order("desc")
      .take(args.page * 100);
    return messages.reverse();
  },
});