import { SearchResult, ProcessedResponse } from "./types";

// Process LangGraph agent response and extract structured data
export function processAgentResponse(result: unknown): ProcessedResponse {
  let responseContent = "";
  let sources: SearchResult[] = [];
  let followUpQuestions: string[] = [];

  if (result && typeof result === "object" && "error" in result) {
    responseContent = (result as { error: string }).error;
  } else if (
    result && typeof result === "object" && "messages" in result
  ) {
    const messages = (result as { messages: unknown[] }).messages;
    if (Array.isArray(messages) && messages.length > 0) {
      // Extract the final message content
      const finalMessage = messages[messages.length - 1];
      responseContent = extractMessageContent(finalMessage);

      // Extract structured data from intermediate results
      const structuredData = extractStructuredData(messages);
      sources = structuredData.sources;
      followUpQuestions = structuredData.followUpQuestions;
    }
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
function extractMessageContent(message: unknown): string {
  if (message && typeof message === "object" && "content" in message) {
    const content = (message as { content: unknown }).content;
    if (typeof content === "string") {
      return content;
    } else if (content) {
      return JSON.stringify(content);
    }
  }
  return "I encountered an error processing your request.";
}

// Extract structured data (sources, follow-up questions) from message chain
function extractStructuredData(messages: unknown[]): {
  sources: SearchResult[];
  followUpQuestions: string[];
} {
  let sources: SearchResult[] = [];
  let followUpQuestions: string[] = [];

  for (const msg of messages) {
    if (msg && typeof msg === "object" && "content" in msg && typeof (msg as { content: unknown }).content === "string") {
      try {
        const parsed = JSON.parse((msg as { content: string }).content);
        if (parsed.type === "perplexity_analysis" && parsed.sources) {
          sources = parsed.sources.map((s: { title: string; url: string; content: string; source: string }) => ({
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

// Optionally we could add HTML transformation here in future to enhance formatting further