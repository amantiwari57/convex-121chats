import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(), // This should be hashed on the client side
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      password: args.password, // Password should already be hashed
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (user) {
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    if (Object.keys(updates).length === 0) {
      throw new Error("No updates provided");
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
}); 