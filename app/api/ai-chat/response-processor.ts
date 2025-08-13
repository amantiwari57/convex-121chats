import { SearchResult, ProcessedResponse } from "./types";

// Process LangGraph agent response and extract structured data
export function processAgentResponse(result: any): ProcessedResponse {
  let responseContent = "";
  let sources: SearchResult[] = [];
  let followUpQuestions: string[] = [];

  if ("error" in result) {
    responseContent = result.error;
  } else if (
    "messages" in result &&
    result.messages &&
    result.messages.length > 0
  ) {
    // Extract the final message content
    const finalMessage = result.messages[result.messages.length - 1];
    responseContent = extractMessageContent(finalMessage);

    // Extract structured data from intermediate results
    const structuredData = extractStructuredData(result.messages);
    sources = structuredData.sources;
    followUpQuestions = structuredData.followUpQuestions;
  } else {
    responseContent = "I encountered an error processing your request.";
  }

  return {
    responseContent,
    sources,
    followUpQuestions,
  };
}

// Extract content from a message, handling different content types
function extractMessageContent(message: any): string {
  if (typeof message.content === "string") {
    return message.content;
  } else if (message.content) {
    return JSON.stringify(message.content);
  }
  return "I encountered an error processing your request.";
}

// Extract structured data (sources, follow-up questions) from message chain
function extractStructuredData(messages: any[]): {
  sources: SearchResult[];
  followUpQuestions: string[];
} {
  let sources: SearchResult[] = [];
  let followUpQuestions: string[] = [];

  for (const msg of messages) {
    if (msg.content && typeof msg.content === "string") {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.type === "perplexity_analysis" && parsed.sources) {
          sources = parsed.sources.map((s: any) => ({
            title: s.title,
            url: s.url,
            content: s.content,
            source: s.source,
          }));
          followUpQuestions = parsed.followUpQuestions || [];
          break; // Use the first analysis we find
        }
      } catch {
        // Not JSON, continue to next message
        continue;
      }
    }
  }

  return { sources, followUpQuestions };
}
