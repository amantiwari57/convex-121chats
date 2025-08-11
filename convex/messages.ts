import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    chat: v.id("chat"),
    sender: v.string(), // Clerk user ID
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

export const markMessagesAsRead = mutation({
  args: {
    chat: v.id("chat"),
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    // Get all messages in the chat that the user hasn't read yet
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chat))
      .collect();

    // Update each message to mark it as read by this user
    const updates = messages
      .filter(message => {
        // Don't mark own messages as read
        if (message.sender === args.userId) return false;
        
        // Check if already read by this user
        const alreadyRead = message.readBy?.some(read => read.userId === args.userId);
        return !alreadyRead;
      })
      .map(message => {
        const readBy = message.readBy || [];
        const newReadBy = [...readBy, {
          userId: args.userId,
          readAt: Date.now(),
        }];
        
        return ctx.db.patch(message._id, {
          readBy: newReadBy,
        });
      });

    await Promise.all(updates);
  },
});