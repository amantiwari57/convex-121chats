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
export async function askQuestion(question: string, imageUrls?: string[]) {
  try {
    console.log(`\n🤖 Processing question: "${question}"`);
    if (imageUrls && imageUrls.length > 0) {
      console.log(`📸 With ${imageUrls.length} image(s): ${imageUrls.join(', ')}`);
    }
    
    // Check if the user is asking for search/research
    const needsSearch = shouldUseSearchTools(question);
    
    // Prepare the content with images if provided
    const content = createContentWithImages(question, imageUrls, needsSearch);
    
    if (needsSearch) {
      console.log(`⏳ User requested search/research - using tools...\n`);
      const result = await agent.invoke({
        messages: [
          {
            role: "user",
            content,
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
          content,
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
  return `You are Perplexico, an AI research assistant. For the user's question: "${question}"

1) Use the perplexity_search tool to gather up-to-date sources.
2) Use the ai_analysis tool to structure findings.
3) Produce a concise, point-wise answer with:
   - A short overview
   - Bullet points covering key aspects
   - Optional lightweight table(s) if it helps compare items
   - Inline source references like [1], [2] after relevant statements
   - Include direct links next to items when helpful
4) Offer 2-3 follow-up questions.

Prefer clear formatting. Keep it factual and avoid fluff.`;
}

// Create the prompt for general questions
function createGeneralPrompt(question: string): string {
  return `You are Perplexico, a helpful AI assistant. The user asked: "${question}"

Provide a clear, structured response with:
- A short overview
- Bullet points covering key details
- Optional quick comparison table when relevant
- Suggest 2 short follow-up questions at the end.`;
}

// Create content with images if provided
function createContentWithImages(question: string, imageUrls?: string[], needsSearch: boolean = false): string {
  let content = needsSearch ? createSearchPrompt(question) : createGeneralPrompt(question);
  
  if (imageUrls && imageUrls.length > 0) {
    const imageSection = imageUrls.map((url, index) => 
      `![Image ${index + 1}](${url})`
    ).join('\n\n');
    
    content = `${content}

**Images provided by user:**
${imageSection}

Please analyze any images provided along with the text question. If the images are relevant to the question, incorporate your analysis of them into your response.`;
  }
  
  return content;
}
