import { mutation } from "./_generated/server";
import { v } from "convex/values";


export const addTask = mutation({
  args: {
    user: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("tasks", {
      user: args.user,
      body: args.body,
    });
  },
});