import { env } from "$env/dynamic/private";
import type { GrokNewsResponse, GrokNewsItem } from "$lib/types/news";

const DEFAULT_API_URL = "https://api.x.ai/v1";

interface GrokMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

interface GrokChatRequest {
	model: string;
	messages: GrokMessage[];
	temperature?: number;
	max_tokens?: number;
}

/**
 * Call Grok API to fetch news from specified sources
 */
export async function fetchNewsFromGrok(
	sources: string[],
	stockSymbols?: string[]
): Promise<GrokNewsResponse> {
	const GROK_API_KEY = env.GROK_API_KEY;
	const GROK_API_URL = env.GROK_API_URL;

	if (!GROK_API_KEY) {
		throw new Error("GROK_API_KEY is not configured");
	}

	const apiUrl = GROK_API_URL || DEFAULT_API_URL;
	const endpoint = `${apiUrl}/chat/completions`;

	// Build prompt for news aggregation
	const prompt = buildNewsPrompt(sources, stockSymbols);

	const requestBody: GrokChatRequest = {
		model: "grok-beta", // Adjust model name based on xAI's available models
		messages: [
			{
				role: "system",
				content:
					"You are a financial news aggregator. Extract and structure news articles about stocks and companies. Return data in JSON format.",
			},
			{
				role: "user",
				content: prompt,
			},
		],
		temperature: 0.7,
		max_tokens: 4000,
	};

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.GROK_API_KEY}`,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Grok API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error("No content in Grok API response");
		}

		// Parse JSON response from Grok
		return parseGrokResponse(content, sources);
	} catch (error) {
		console.error("Error fetching news from Grok:", error);
		throw error;
	}
}

/**
 * Build prompt for news aggregation
 */
function buildNewsPrompt(sources: string[], stockSymbols?: string[]): string {
	const sourceList = sources.join(", ");
	const stockFilter = stockSymbols && stockSymbols.length > 0 
		? ` Focus on these stock symbols: ${stockSymbols.join(", ")}.`
		: "";

	return `Fetch the latest financial news from these sources: ${sourceList}.${stockFilter}

Please return a JSON object with the following structure:
{
  "items": [
    {
      "headline": "News headline",
      "summary": "Brief summary",
      "source": "Source name (e.g., CNBC, Twitter, etc.)",
      "stockSymbol": "Stock symbol if mentioned",
      "stockName": "Full company name",
      "sentiment": "positive|negative|neutral",
      "confidence": "High|Medium|Low",
      "date": "YYYY-MM-DD",
      "url": "Source URL if available"
    }
  ],
  "sources": ["list", "of", "sources", "checked"],
  "timestamp": "ISO timestamp"
}

Extract real, current news. If no recent news is found, return an empty items array.`;
}

/**
 * Parse Grok API response and extract structured news data
 */
function parseGrokResponse(content: string, sources: string[]): GrokNewsResponse {
	try {
		// Try to extract JSON from markdown code blocks if present
		let jsonContent = content.trim();
		
		// Remove markdown code blocks if present
		if (jsonContent.startsWith("```")) {
			const lines = jsonContent.split("\n");
			// Remove first line (```json or ```)
			lines.shift();
			// Remove last line (```)
			if (lines[lines.length - 1]?.trim() === "```") {
				lines.pop();
			}
			jsonContent = lines.join("\n");
		}

		const parsed = JSON.parse(jsonContent) as GrokNewsResponse;

		// Validate and normalize the response
		if (!parsed.items || !Array.isArray(parsed.items)) {
			return {
				items: [],
				sources: sources,
				timestamp: new Date().toISOString(),
			};
		}

		// Ensure all items have required fields
		const normalizedItems: GrokNewsItem[] = parsed.items.map((item) => ({
			headline: item.headline || "No headline",
			summary: item.summary || item.headline || "No summary",
			source: item.source || "Unknown",
			stockSymbol: item.stockSymbol,
			stockName: item.stockName,
			sentiment: item.sentiment || "neutral",
			confidence: item.confidence || "Medium",
			date: item.date || new Date().toISOString().split("T")[0],
			url: item.url,
		}));

		return {
			items: normalizedItems,
			sources: parsed.sources || sources,
			timestamp: parsed.timestamp || new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error parsing Grok response:", error);
		console.error("Raw content:", content);
		
		// Return empty response on parse error
		return {
			items: [],
			sources: sources,
			timestamp: new Date().toISOString(),
		};
	}
}

/**
 * Fetch news for a specific source
 */
export async function fetchNewsFromSource(
	source: string,
	stockSymbols?: string[]
): Promise<GrokNewsItem[]> {
	try {
		const response = await fetchNewsFromGrok([source], stockSymbols);
		return response.items;
	} catch (error) {
		console.error(`Error fetching news from ${source}:`, error);
		return [];
	}
}

