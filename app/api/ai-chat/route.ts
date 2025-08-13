import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`🤖 Processing AI chat message: "${message}"`);

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "start",
                message: "Processing your question...",
              })}\n\n`,
            ),
          );

          // Create the prompt for the AI agent
          const _prompt = `You are Perplexico, an AI assistant that provides comprehensive, well-researched answers with sources. For the user's question: "${message}"

1. First, search for current information using the perplexity_search tool
2. Then analyze the results using the ai_analysis tool to provide a structured response
3. Provide a clear, informative answer with proper source citations
4. Include relevant follow-up questions

Make sure to cite sources using [1], [2], etc. format and provide the source list at the end.`;

          // Use the existing askQuestion function for now, but with progress updates
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "search",
                message: "Searching the web...",
              })}\n\n`,
            ),
          );

          // Import and use the askQuestion function
          const { askQuestion } = await import("./agent");
          const result = await askQuestion(message);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "analysis",
                message: "Analyzing search results...",
              })}\n\n`,
            ),
          );

          // Process the response
          const { processAgentResponse } = await import("./response-processor");
          const { responseContent, sources, followUpQuestions } =
            processAgentResponse(result);

          // Send content chunk
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "content",
                content: responseContent,
              })}\n\n`,
            ),
          );

          // Send final structured data
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                response: responseContent,
                sources: sources,
                followUpQuestions: followUpQuestions,
                timestamp: new Date().toISOString(),
              })}\n\n`,
            ),
          );

          // End the stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Failed to process AI chat message",
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process AI chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
