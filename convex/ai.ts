import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add message to Perplexico (single shared chat)
export const addPerplexicoMessage = mutation({
  args: {
    role: v.string(),
    content: v.string(),
    userId: v.string(), // Clerk user ID
    sources: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      content: v.string(),
      source: v.string(),
    }))),
    followUpQuestions: v.optional(v.array(v.string())),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("perplexicoMessages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      sources: args.sources,
      followUpQuestions: args.followUpQuestions,
      searchQuery: args.searchQuery,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get all Perplexico messages (paginated)
export const getPerplexicoMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const messages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .order("asc") // Get in ascending order
      .take(limit);

    return messages;
  },
});

// Get recent Perplexico messages (for real-time updates)
export const getRecentPerplexicoMessages = query({
  args: {
    after: v.number(), // timestamp to get messages after
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .filter((q) => q.gt(q.field("createdAt"), args.after))
      .order("asc")
      .collect();

    return messages;
  },
});

// Get message count (for pagination)
export const getPerplexicoMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("perplexicoMessages")
      .collect();
    
    return messages.length;
  },
});

// Delete old messages (admin function to keep chat manageable)
export const cleanupOldMessages = mutation({
  args: {
    keepLastN: v.number(), // Keep only the last N messages
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    // Delete messages beyond the keepLastN limit
    const messagesToDelete = allMessages.slice(args.keepLastN);
    
    for (const message of messagesToDelete) {
      await ctx.db.delete(message._id);
    }

    return {
      deleted: messagesToDelete.length,
      remaining: allMessages.length - messagesToDelete.length,
    };
  },
});