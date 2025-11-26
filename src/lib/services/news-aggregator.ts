import { fetchNewsFromGrok } from "./grok-service";
import { getFirestoreDB } from "./firebase-admin";
import type { NewsItem, NewsDetail, Citation, GrokNewsItem } from "$lib/types/news";
import { FieldValue } from "firebase-admin/firestore";

// Channel name mapping: config channel name -> Grok source name
const CHANNEL_MAPPING: Record<string, string> = {
	"CNBC News": "CNBC",
	"Twitter": "Twitter/X",
	"Reddit Community": "Reddit",
	"Live Mint": "Live Mint",
	"Money Control": "Money Control",
	"Times Prime": "Times Prime",
	"Google Finance": "Google Finance",
};

/**
 * Aggregate news from multiple sources using Grok API
 */
export async function aggregateNews(
	sources: string[],
	userId?: string,
	stockSymbols?: string[]
): Promise<NewsItem[]> {
	if (sources.length === 0) {
		return [];
	}

	try {
		// Map channel names to Grok source names
		const grokSources = sources.map((source) => CHANNEL_MAPPING[source] || source);

		// Fetch news from Grok API
		const grokResponse = await fetchNewsFromGrok(grokSources, stockSymbols);

		// Transform Grok items to NewsItem format
		const newsItems = await transformGrokItemsToNewsItems(
			grokResponse.items,
			userId
		);

		// Deduplicate news items
		const deduplicated = deduplicateNewsItems(newsItems);

		// Store in Firestore
		if (deduplicated.length > 0) {
			await storeNewsItems(deduplicated, userId);
		}

		return deduplicated;
	} catch (error) {
		console.error("Error aggregating news:", error);
		throw error;
	}
}

/**
 * Transform Grok news items to NewsItem format
 */
async function transformGrokItemsToNewsItems(
	grokItems: GrokNewsItem[],
	userId?: string
): Promise<NewsItem[]> {
	const newsItems: NewsItem[] = [];

	for (const item of grokItems) {
		// Extract stock information
		const code = item.stockSymbol?.toUpperCase() || "UNKNOWN";
		const name = item.stockName || code;

		// Calculate market metrics (these would ideally come from a stock API)
		// For now, we'll use placeholder values that can be enriched later
		const cmp = 0; // Current Market Price - to be fetched from stock API
		const pe = 0; // P/E Ratio - to be fetched from stock API
		const change = calculateChangeFromSentiment(item.sentiment);
		const changeTone = item.sentiment === "positive" ? "positive" : "negative";

		// Determine sector (could be enhanced with stock API)
		const sector = "General";

		const newsItem: NewsItem = {
			id: generateNewsId(item),
			code,
			name,
			headline: item.headline,
			source: item.source,
			cmp,
			pe,
			change,
			changeTone,
			sector,
			confidence: item.confidence || "Medium",
			date: item.date || new Date().toISOString().split("T")[0],
			userId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		newsItems.push(newsItem);
	}

	return newsItems;
}

/**
 * Generate a unique ID for a news item
 */
function generateNewsId(item: GrokNewsItem): string {
	// Create ID from headline hash and source
	const hash = simpleHash(item.headline + item.source + (item.date || ""));
	return `news_${hash}`;
}

/**
 * Simple hash function for generating IDs
 */
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(36);
}

/**
 * Calculate percentage change from sentiment
 */
function calculateChangeFromSentiment(sentiment?: string): number {
	// Placeholder calculation - in production, this should use actual stock data
	switch (sentiment) {
		case "positive":
			return Math.random() * 5 + 0.5; // 0.5% to 5.5%
		case "negative":
			return -(Math.random() * 5 + 0.5); // -0.5% to -5.5%
		default:
			return Math.random() * 2 - 1; // -1% to 1%
	}
}

/**
 * Deduplicate news items based on headline and source
 */
function deduplicateNewsItems(items: NewsItem[]): NewsItem[] {
	const seen = new Set<string>();
	const unique: NewsItem[] = [];

	for (const item of items) {
		const key = `${item.headline.toLowerCase()}_${item.source}_${item.date}`;
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(item);
		}
	}

	return unique;
}

/**
 * Store news items in Firestore
 */
async function storeNewsItems(items: NewsItem[], userId?: string): Promise<void> {
	const db = getFirestoreDB();
	const batch = db.batch();

	for (const item of items) {
		const docRef = db.collection("news_items").doc(item.id);
		
		// Check if document exists
		const doc = await docRef.get();
		
		if (doc.exists) {
			// Update existing document
			batch.update(docRef, {
				...item,
				updatedAt: FieldValue.serverTimestamp(),
			});
		} else {
			// Create new document
			batch.set(docRef, {
				...item,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp(),
			});
		}
	}

	await batch.commit();
}

/**
 * Create NewsDetail from NewsItem and Grok data
 */
export async function createNewsDetail(
	newsItem: NewsItem,
	citations: Citation[] = []
): Promise<NewsDetail> {
	// Calculate market impact based on change
	const marketImpact = calculateMarketImpact(newsItem.change);
	
	// Calculate investor mood (placeholder - could be enhanced with sentiment analysis)
	const investorMood = calculateInvestorMood(newsItem.changeTone, newsItem.change);

	// Generate summary from headline and citations
	const summary = generateSummary(newsItem.headline, citations);

	// Extract dominant phrase (placeholder - could use NLP)
	const dominantPhrase = extractDominantPhrase(newsItem.headline, citations);

	const detail: NewsDetail = {
		id: newsItem.id,
		code: newsItem.code,
		name: newsItem.name,
		summary,
		marketImpact,
		expertReview: newsItem.changeTone === "positive" ? "Positive" : "Negative",
		changes: {
			"1D": newsItem.change,
			"1W": newsItem.change * 2,
			"1M": newsItem.change * 4,
			"1Y": newsItem.change * 10,
		},
		investorMood,
		dominantPhrase,
		citations,
		userId: newsItem.userId,
		createdAt: newsItem.createdAt,
		updatedAt: new Date().toISOString(),
	};

	return detail;
}

/**
 * Calculate market impact from percentage change
 */
function calculateMarketImpact(change: number): {
	level: "Very Positive" | "Positive" | "Neutral" | "Negative" | "Very Negative";
	percentage: number;
} {
	const absChange = Math.abs(change);
	
	if (change > 5) {
		return { level: "Very Positive", percentage: Math.min(absChange * 15, 100) };
	} else if (change > 2) {
		return { level: "Positive", percentage: Math.min(absChange * 12, 85) };
	} else if (change < -5) {
		return { level: "Very Negative", percentage: Math.min(absChange * 15, 100) };
	} else if (change < -2) {
		return { level: "Negative", percentage: Math.min(absChange * 12, 85) };
	} else {
		return { level: "Neutral", percentage: Math.min(absChange * 10, 50) };
	}
}

/**
 * Calculate investor mood percentages
 */
function calculateInvestorMood(
	changeTone: "positive" | "negative",
	change: number
): { bullish: number; neutral: number; bearish: number } {
	const absChange = Math.abs(change);
	
	if (changeTone === "positive") {
		return {
			bullish: Math.min(40 + absChange * 5, 70),
			neutral: Math.max(30 - absChange * 2, 20),
			bearish: Math.max(30 - absChange * 3, 10),
		};
	} else {
		return {
			bullish: Math.max(20 - absChange * 2, 10),
			neutral: Math.max(30 - absChange, 20),
			bearish: Math.min(50 + absChange * 3, 70),
		};
	}
}

/**
 * Generate summary from headline and citations
 */
function generateSummary(headline: string, citations: Citation[]): string {
	if (citations.length > 0) {
		return citations[0].summary || headline;
	}
	return headline;
}

/**
 * Extract dominant phrase from headline and citations
 */
function extractDominantPhrase(headline: string, citations: Citation[]): string {
	// Simple extraction - in production, use NLP
	const phrases = [
		"Strong growth",
		"Market expansion",
		"Revenue increase",
		"Profit surge",
		"Strategic partnership",
		"Market volatility",
		"Declining performance",
		"Competitive pressure",
	];

	// Return a phrase based on sentiment
	if (headline.toLowerCase().includes("growth") || headline.toLowerCase().includes("increase")) {
		return phrases[0] || "Positive market sentiment";
	} else if (headline.toLowerCase().includes("decline") || headline.toLowerCase().includes("drop")) {
		return phrases[6] || "Market concerns";
	} else {
		return phrases[4] || "Market development";
	}
}

