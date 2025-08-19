import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    chat: v.id("chat"),
    sender: v.string(), // Clerk user ID
    body: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageData: any = {
      chat: args.chat,
      sender: args.sender,
      body: args.body,
      createdAt: Date.now(),
    };

    // Add media fields if provided
    if (args.mediaUrl) {
      messageData.mediaUrl = args.mediaUrl;
      messageData.mediaType = args.mediaType;
      messageData.fileName = args.fileName;
    }

    await ctx.db.insert("messages", messageData);

    // Update last message - show media indicator if it's a media message
    const lastMessageBody = args.mediaUrl
      ? args.mediaType === "image"
        ? "📷 Image"
        : "🎥 Video"
      : args.body;

    await ctx.db.patch(args.chat, {
      lastMessage: {
        userId: args.sender,
        body: lastMessageBody,
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
      .filter((message) => {
        // Don't mark own messages as read
        if (message.sender === args.userId) return false;

        // Check if already read by this user
        const alreadyRead = message.readBy?.some(
          (read) => read.userId === args.userId,
        );
        return !alreadyRead;
      })
      .map((message) => {
        const readBy = message.readBy || [];
        const newReadBy = [
          ...readBy,
          {
            userId: args.userId,
            readAt: Date.now(),
          },
        ];

        return ctx.db.patch(message._id, {
          readBy: newReadBy,
        });
      });

    await Promise.all(updates);
  },
});

// Get unread message count for a specific chat
export const getUnreadCount = query({
  args: {
    chat: v.id("chat"),
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chat))
      .collect();

    const unreadCount = messages.filter((message) => {
      // Don't count own messages
      if (message.sender === args.userId) return false;

      // Check if read by this user
      const readByUser = message.readBy?.some(
        (read) => read.userId === args.userId,
      );
      return !readByUser;
    }).length;

    return unreadCount;
  },
});

// Get unread counts for all user's chats
export const getUnreadCounts = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    // Get all chats the user participates in
    const allChats = await ctx.db.query("chat").collect();
    const chats = allChats.filter((chat) =>
      chat.participants.includes(args.userId),
    );

    const unreadCounts: Record<string, number> = {};

    for (const chat of chats) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chat", chat._id))
        .collect();

      const unreadCount = messages.filter((message) => {
        // Don't count own messages
        if (message.sender === args.userId) return false;

        // Check if read by this user
        const readByUser = message.readBy?.some(
          (read) => read.userId === args.userId,
        );
        return !readByUser;
      }).length;

      unreadCounts[chat._id] = unreadCount;
    }

    return unreadCounts;
  },
});
