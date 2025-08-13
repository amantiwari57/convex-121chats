// TypeScript interfaces for AI chat functionality

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  source: string;
}

export interface SearchApproach {
  name: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export interface ParsedSearchResults {
  type: string;
  query: string;
  timestamp: string;
  source: string;
  approach: string;
  results: SearchResult[];
  total_found: number;
}

export interface AnalysisResult {
  type: string;
  userQuery: string;
  summary: string;
  sources: Array<{
    index: number;
    title: string;
    url: string;
    content: string;
    source: string;
  }>;
  followUpQuestions: string[];
  timestamp: string;
  totalSources: number;
}

export interface ProcessedResponse {
  responseContent: string;
  sources: SearchResult[];
  followUpQuestions: string[];
}
