import { SearchResult, ParsedSearchResults } from "./types";

// HTML parsing function to extract search results
export async function parseSearchResults(
  query: string,
  htmlText: string,
  approach: string,
): Promise<ParsedSearchResults> {
  console.log(`🔍 Parsing HTML search results...`);

  // Simple HTML parsing to extract search results
  const results: SearchResult[] = [];

  // Look for different result patterns
  const resultPatterns = [
    /<div class="result[^"]*"[^>]*>(.*?)<\/div>/gs,
    /<article class="result[^"]*"[^>]*>(.*?)<\/article>/gs,
    /<div[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)<\/div>/gs,
  ];

  for (const pattern of resultPatterns) {
    const matches = htmlText.matchAll(pattern);
    for (const match of matches) {
      const resultHtml = match[1];

      // Extract title
      const titleMatch =
        resultHtml.match(/<h\d[^>]*>.*?<a[^>]*>(.*?)<\/a>.*?<\/h\d>/s) ||
        resultHtml.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/a>/s) ||
        resultHtml.match(/<a[^>]*>(.*?)<\/a>/s);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : "No title";

      // Extract URL
      const urlMatch = resultHtml.match(/href="([^"]+)"/);
      const url = urlMatch ? urlMatch[1] : "";

      // Extract content/description
      const contentMatch =
        resultHtml.match(/<p[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/p>/s) ||
        resultHtml.match(
          /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s,
        ) ||
        resultHtml.match(/<p[^>]*>(.*?)<\/p>/s);
      const content = contentMatch
        ? contentMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      if (title && title !== "No title" && url) {
        try {
          results.push({
            title: title.substring(0, 200),
            url: url,
            content: content.substring(0, 500),
            source: new URL(url).hostname,
          });
        } catch (urlError) {
          // Skip invalid URLs
          continue;
        }
      }
    }

    if (results.length > 0) break;
  }

  const searchData: ParsedSearchResults = {
    type: "perplexity_search_results",
    query: query,
    timestamp: new Date().toISOString(),
    source: "search.dualdevs.in",
    approach: approach,
    results: results.slice(0, 5), // Limit to top 5 results
    total_found: results.length,
  };

  console.log(`✅ Parsed ${results.length} search results`);
  return searchData;
}

// JSON parsing function
export async function parseJSONResults(
  query: string,
  jsonData: any,
  approach: string,
): Promise<ParsedSearchResults> {
  console.log(`🔍 Parsing JSON search results...`);

  const results: SearchResult[] = jsonData.results
    .slice(0, 5)
    .map((result: any) => ({
      title: result.title || "No title",
      url: result.url || "",
      content: result.content || result.description || "",
      source: result.source || (result.url ? new URL(result.url).hostname : ""),
    }));

  const searchData: ParsedSearchResults = {
    type: "perplexity_search_results",
    query: query,
    timestamp: new Date().toISOString(),
    source: "search.dualdevs.in",
    approach: approach,
    results: results,
    total_found: jsonData.results.length,
  };

  console.log(`✅ Parsed ${results.length} JSON search results`);
  return searchData;
}
