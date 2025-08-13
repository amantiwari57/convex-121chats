import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SearchApproach, SearchResult, AnalysisResult } from "./types";
import { parseSearchResults, parseJSONResults } from "./search-parser";

// Enhanced search tool with Perplexity-like features
export const perplexitySearchTool = tool(
  async ({ query }: { query: string }): Promise<string> => {
    const apiKey = process.env.SEARCH_API_KEY || "";
    const baseUrl =
      process.env.SEARCH_BASE_URL || "https://search.dualdevs.in/search";

    try {
      console.log(`🔍 Processing query: "${query}"`);

      // Try multiple approaches for better results
      const searchApproaches: SearchApproach[] = [
        {
          name: "Form Data Approach",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: new URLSearchParams({
            q: query,
            category_general: "1",
            language: "auto",
            safesearch: "0",
            theme: "simple",
          }).toString(),
        },
        {
          name: "JSON Approach",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            q: query,
            format: "json",
            language: "en",
            output_format: "json",
            format_type: "json",
          }),
        },
      ];

      let searchResults = null;
      let workingApproach = null;

      for (const approach of searchApproaches) {
        try {
          console.log(`🔍 Trying ${approach.name}`);

          const response = await fetch(baseUrl, {
            method: approach.method,
            headers: approach.headers,
            body: approach.body,
          });

          console.log(`📡 ${approach.name} status: ${response.status}`);

          if (response.ok) {
            const responseText = await response.text();

            // Check if we got actual search results or just the homepage
            if (
              responseText.includes('<div class="result') ||
              responseText.includes('<article class="result') ||
              responseText.includes('id="results"') ||
              (responseText.includes("results") && responseText.length > 10000)
            ) {
              console.log(`✅ Found search results with ${approach.name}`);
              searchResults = await parseSearchResults(
                query,
                responseText,
                approach.name,
              );
              workingApproach = approach.name;
              break;
            } else if (
              responseText.includes("SearXNG") &&
              responseText.length < 10000
            ) {
              console.log(
                `⚠️ ${approach.name} returned homepage, trying next approach`,
              );
              continue;
            } else {
              // Try to parse as JSON
              try {
                const jsonData = JSON.parse(responseText);
                if (jsonData.results && jsonData.results.length > 0) {
                  console.log(`✅ Found JSON results with ${approach.name}`);
                  searchResults = await parseJSONResults(
                    query,
                    jsonData,
                    approach.name,
                  );
                  workingApproach = approach.name;
                  break;
                }
              } catch (_jsonError) {
                console.log(
                  `⚠️ ${approach.name} - not JSON, trying next approach`,
                );
                continue;
              }
            }
          }
        } catch (approachError) {
          console.log(
            `❌ ${approach.name} failed: ${approachError instanceof Error ? approachError.message : "Unknown error"}`,
          );
          continue;
        }
      }

      if (searchResults) {
        console.log(`✅ Successfully used ${workingApproach}`);
        return JSON.stringify(searchResults);
      } else {
        // Fallback: return error message
        return JSON.stringify({
          type: "search_error",
          query: query,
          error: "No search results found",
          message: "All search approaches failed to return results",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.log(
        `❌ Search error:`,
        error instanceof Error ? error.message : "Unknown error",
      );
      console.log(`❌ Full error:`, error);
      return JSON.stringify({
        type: "search_error",
        query: query,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "perplexity_search",
    description:
      "Advanced search tool with Perplexity-like features. Searches the web, parses results, and provides structured data for AI analysis.",
    schema: z.object({
      query: z.string().describe("The search query to process."),
    }),
  },
);

// AI Analysis tool for Perplexity-like responses
export const aiAnalysisTool = tool(
  async ({
    searchResults,
    userQuery,
  }: {
    searchResults: string;
    userQuery: string;
  }): Promise<string> => {
    try {
      console.log(`🤖 Analyzing search results for: "${userQuery}"`);

      const parsedResults = JSON.parse(searchResults);

      if (!parsedResults.results || parsedResults.results.length === 0) {
        return JSON.stringify({
          type: "analysis_error",
          message: "No search results to analyze",
          userQuery: userQuery,
        });
      }

      // Create a comprehensive summary
      const sources = parsedResults.results.map(
        (result: SearchResult, index: number) => ({
          index: index + 1,
          title: result.title,
          url: result.url,
          content: result.content,
          source: result.source,
        }),
      );

      // Generate follow-up questions
      const followUpQuestions = generateFollowUpQuestions(userQuery, sources);

      // Create Perplexity-style response
      const analysis: AnalysisResult = {
        type: "perplexity_analysis",
        userQuery: userQuery,
        summary: createSummary(sources, userQuery),
        sources: sources,
        followUpQuestions: followUpQuestions,
        timestamp: new Date().toISOString(),
        totalSources: sources.length,
      };

      console.log(`✅ Analysis completed for: "${userQuery}"`);
      return JSON.stringify(analysis);
    } catch (error) {
      console.error(
        `❌ Analysis error:`,
        error instanceof Error ? error.message : "Unknown error",
      );
      return JSON.stringify({
        type: "analysis_error",
        error: error instanceof Error ? error.message : "Unknown error",
        userQuery: userQuery,
      });
    }
  },
  {
    name: "ai_analysis",
    description:
      "Analyzes search results and provides Perplexity-like AI-powered summaries with sources and follow-up questions.",
    schema: z.object({
      searchResults: z
        .string()
        .describe("JSON string of search results to analyze."),
      userQuery: z.string().describe("The original user query."),
    }),
  },
);

// Helper function to create summary
function createSummary(sources: Array<{ content?: string; title: string; index: number }>, userQuery: string): string {
  if (sources.length === 0) return "No information found.";

  const keyPoints = sources
    .map((source) => {
      if (source.content) {
        const sentences = source.content
          .split(/[.!?]/)
          .filter((s: string) => s.trim().length > 20);
        return sentences[0]?.trim() || source.title;
      }
      return source.title;
    })
    .filter((point) => point);

  return (
    `Based on the search results for "${userQuery}", here are the key findings:\n\n` +
    keyPoints
      .slice(0, 3)
      .map((point, index) => `${index + 1}. ${point} [${sources[index].index}]`)
      .join("\n\n")
  );
}

// Helper function to generate follow-up questions
function generateFollowUpQuestions(
  userQuery: string,
  _sources: Array<{ content?: string; title: string; index: number }>,
): string[] {
  const questions: string[] = [];

  // Generic follow-up questions based on query type
  if (
    userQuery.toLowerCase().includes("price") ||
    userQuery.toLowerCase().includes("cost")
  ) {
    questions.push(
      `What are the best deals for ${userQuery.replace(/price|cost/gi, "").trim()}?`,
    );
    questions.push(
      `Where can I buy ${userQuery.replace(/price|cost/gi, "").trim()} at the lowest price?`,
    );
  } else if (
    userQuery.toLowerCase().includes("compare") ||
    userQuery.toLowerCase().includes("vs")
  ) {
    questions.push(`What are the pros and cons of each option?`);
    questions.push(`Which option is better for different use cases?`);
  } else {
    questions.push(`What are the latest developments in ${userQuery}?`);
    questions.push(`How does ${userQuery} work?`);
    questions.push(`What are the benefits of ${userQuery}?`);
  }

  return questions.slice(0, 3);
}
