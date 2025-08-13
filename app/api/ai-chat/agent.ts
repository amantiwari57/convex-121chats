import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { perplexitySearchTool, aiAnalysisTool } from "./tools";

// Create the AI model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// Create the agent with Perplexity-like tools
export const agent = createReactAgent({
  llm: model,
  tools: [perplexitySearchTool, aiAnalysisTool],
});

// Process a question using the LangGraph agent
export async function askQuestion(question: string) {
  try {
    console.log(`\n🤖 Processing question: "${question}"`);
    console.log(`⏳ Please wait while I search for information...\n`);

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: createPrompt(question),
        },
      ],
    });

    console.log("\n🤖 Agent response:", result);
    return result;
  } catch (error) {
    console.error("❌ Error processing question:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Create the prompt for the AI agent
function createPrompt(question: string): string {
  return `You are Perplexico, an AI assistant that provides comprehensive, well-researched answers with sources. For the user's question: "${question}"

1. First, search for current information using the perplexity_search tool
2. Then analyze the results using the ai_analysis tool to provide a structured response
3. Provide a clear, informative answer with proper source citations
4. Include relevant follow-up questions

Make sure to cite sources using [1], [2], etc. format and provide the source list at the end.`;
}
