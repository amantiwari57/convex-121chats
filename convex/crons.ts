import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup every hour to delete messages older than 24 hours
crons.interval(
  "cleanup old messages", 
  { hours: 1 }, 
  internal.ai.cleanupOldMessages,
  {}
);

export default crons;
