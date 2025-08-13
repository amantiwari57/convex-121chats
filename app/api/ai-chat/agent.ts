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
    
    // Check if the user is asking for search/research
    const needsSearch = shouldUseSearchTools(question);
    
    if (needsSearch) {
      console.log(`⏳ User requested search/research - using tools...\n`);
      const result = await agent.invoke({
        messages: [
          {
            role: "user",
            content: createSearchPrompt(question),
          },
        ],
      });
      console.log("\n🤖 Agent response with tools:", result);
      return result;
    } else {
      console.log(`💬 Providing general AI response...\n`);
      // Provide direct AI response without tools
      const result = await model.invoke([
        {
          role: "user",
          content: createGeneralPrompt(question),
        },
      ]);
      console.log("\n🤖 General AI response:", result);
      return { messages: [result] };
    }
  } catch (error) {
    console.error("❌ Error processing question:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Determine if the user is asking for search/research
function shouldUseSearchTools(question: string): boolean {
  const searchKeywords = [
    'search for', 'find', 'look up', "lookup", 'research', 'latest', 'current', 'news',
    'recent', 'today', 'this week', 'this month', 'this year', '2024', '2025',
    'what is happening', 'trending', 'popular', 'best', 'top', 'compare',
    'prices', 'costs', 'reviews', 'opinions', 'statistics', 'data',
    'information', 'facts', 'details', 'data', 'information', 'facts', 'details', 'data'
  ];
  
  const questionLower = question.toLowerCase();
  
  // Check for explicit search requests
  if (questionLower.includes('search') || questionLower.includes('find') || questionLower.includes('look up')) {
    return true;
  }
  
  // Check for time-sensitive or current information requests
  if (searchKeywords.some(keyword => questionLower.includes(keyword))) {
    return true;
  }
  
  // Check for comparison or analysis requests
  if (questionLower.includes('vs') || questionLower.includes('versus') || questionLower.includes('compare')) {
    return true;
  }
  
  // Check for factual verification or specific data requests
  if (questionLower.includes('how much') || questionLower.includes('how many') || questionLower.includes('what is the')) {
    return true;
  }
  
  return false;
}

// Create the prompt for search/research questions
function createSearchPrompt(question: string): string {
  return `You are Perplexico, an AI assistant that provides comprehensive, well-researched answers with sources. For the user's question: "${question}"

1. First, search for current information using the perplexity_search tool
2. Then analyze the results using the ai_analysis tool to provide a structured response
3. Provide a clear, informative answer with proper source citations
4. Include relevant follow-up questions

Make sure to cite sources using [1], [2], etc. format and provide the source list at the end.`;
}

// Create the prompt for general questions
function createGeneralPrompt(question: string): string {
  return `You are Perplexico, a helpful and knowledgeable AI assistant. The user asked: "${question}"

Please provide a helpful, informative response based on your general knowledge. Be conversational, clear, and engaging. If appropriate, you can:

- Explain concepts in simple terms
- Provide examples or analogies
- Offer practical advice or tips
- Ask clarifying questions if needed
- Suggest related topics of interest

Keep your response focused and helpful without being overly verbose.`;
}
