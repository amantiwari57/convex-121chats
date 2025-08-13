import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Add message to Perplexico (user-specific conversations)
export const addPerplexicoMessage = mutation({
  args: {
    role: v.string(),
    content: v.string(),
    userId: v.string(), // Clerk user ID - now always the actual user, never "system"
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
      userId: args.userId, // Always the actual user ID, AI responses also belong to the user who asked
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

// Get user's own Perplexico messages (paginated)
export const getPerplexicoMessages = query({
  args: {
    userId: v.string(), // Clerk user ID
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    // Get only messages for this specific user
    // Both user messages and AI responses are stored with the user's ID
    const messages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("asc")
      .take(limit);

    return messages;
  },
});

// Get user's recent Perplexico messages (for real-time updates)
export const getRecentPerplexicoMessages = query({
  args: {
    userId: v.string(), // Clerk user ID
    after: v.number(), // timestamp to get messages after
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("createdAt"), args.after)
        )
      )
      .order("asc")
      .collect();

    return messages;
  },
});

// Get user's message count (for pagination)
export const getPerplexicoMessageCount = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return messages.length;
  },
});

// Cleanup old messages (runs automatically every hour via cron)
export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const oldMessages = await ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .filter((q) => q.lt(q.field("createdAt"), twentyFourHoursAgo))
      .collect();

    // Delete messages older than 24 hours
    let deletedCount = 0;
    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }

    return {
      deleted: deletedCount,
      message: `Deleted ${deletedCount} messages older than 24 hours`,
    };
  },
});

// Get all messages for admin purposes (with user filtering)
export const getAllPerplexicoMessages = query({
  args: {
    userId: v.optional(v.string()), // Optional user ID filter for admin
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    let query = ctx.db
      .query("perplexicoMessages")
      .withIndex("by_created_at")
      .order("desc");

    // If userId is provided, filter by that user
    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId));
    }

    const messages = await query.take(limit);
    return messages;
  },
});