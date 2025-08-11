import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNewChat = mutation({
  args: {
    createdBy: v.string(), // Clerk user ID
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.insert("chat", {
      userId: args.createdBy,
      participants: [args.createdBy],
      lastMessage: {
        userId: args.createdBy,
        body: args.initialMessage || "Chat created",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: args.createdBy,
    });
    return chat;
  },
});

export const createChat = mutation({
  args: {
    participants: v.array(v.string()), // Clerk user IDs
    lastMessage: v.object({
      userId: v.string(), // Clerk user ID
      body: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.insert("chat", {
      userId: args.createdBy,
      participants: args.participants,
      lastMessage: args.lastMessage,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
      createdBy: args.createdBy,
    });
    return chat;
  },
});

export const listChats = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    // Get all chats where the user is a participant
    const chats = await ctx.db
      .query("chat")
      .collect();
    
    // Filter to only include chats where the user is a participant
    const userChats = chats.filter(chat => 
      chat.participants.includes(args.userId)
    );
    
    // Sort by updatedAt descending
    return userChats.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const inviteToChat = mutation({
  args: {
    chatId: v.id("chat"),
    invitedUser: v.string(), // Clerk user ID
    invitedBy: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    // Check if the inviter is a participant in the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.includes(args.invitedBy)) {
      throw new Error("Not authorized to invite to this chat");
    }

    // Check if the user is already a participant
    if (chat.participants.includes(args.invitedUser)) {
      throw new Error("User is already a participant in this chat");
    }

    // Create the invitation
    const invite = await ctx.db.insert("chatInvites", {
      chatId: args.chatId,
      invitedBy: args.invitedBy,
      invitedUser: args.invitedUser,
      status: "pending",
      createdAt: Date.now(),
    });

    return invite;
  },
});

export const respondToInvite = mutation({
  args: {
    chatId: v.id("chat"),
    invitedUser: v.string(), // Clerk user ID
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find the pending invitation
    const invite = await ctx.db
      .query("chatInvites")
      .withIndex("by_invited_user", (q) => 
        q.eq("invitedUser", args.invitedUser).eq("status", "pending")
      )
      .filter((q) => q.eq(q.field("chatId"), args.chatId))
      .first();

    if (!invite) {
      throw new Error("No pending invitation found");
    }

    // Update the invitation status
    await ctx.db.patch(invite._id, {
      status: args.accept ? "accepted" : "rejected",
    });

    if (args.accept) {
      // Add the user to the chat participants
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      await ctx.db.patch(args.chatId, {
        participants: [...chat.participants, args.invitedUser],
      });
    }

    return { success: true };
  },
});

export const getPendingInvites = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("chatInvites")
      .withIndex("by_invited_user", (q) => 
        q.eq("invitedUser", args.userId).eq("status", "pending")
      )
      .collect();

    // Get chat details for each invite
    const invitesWithDetails = await Promise.all(
      invites.map(async (invite) => {
        const chat = await ctx.db.get(invite.chatId);
        return {
          ...invite,
          chat,
        };
      })
    );

    return invitesWithDetails;
  },
});

export const getChats = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    // Get all chats where the user is a participant
    const chats = await ctx.db
      .query("chat")
      .collect();
    
    // Filter to only include chats where the user is a participant
    const userChats = chats.filter(chat => 
      chat.participants.includes(args.userId)
    );
    
    // Sort by updatedAt descending
    return userChats.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get all users for chat creation
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();
    
    return users.map(user => ({
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));
  },
});

// Create a chat with selected participants
export const createChatWithParticipants = mutation({
  args: {
    createdBy: v.string(), // Clerk user ID
    participantIds: v.array(v.string()), // Clerk user IDs
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Include the creator in participants
    const allParticipants = [args.createdBy, ...args.participantIds];
    
    const initialMsg = args.initialMessage || "Chat created";
    
    const chat = await ctx.db.insert("chat", {
      userId: args.createdBy,
      participants: allParticipants,
      lastMessage: {
        userId: args.createdBy,
        body: initialMsg,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: args.createdBy,
    });
    
    // Create the initial message in the messages table
    await ctx.db.insert("messages", {
      chat: chat,
      sender: args.createdBy,
      body: initialMsg,
      createdAt: Date.now(),
    });
    
    return chat;
  },
});