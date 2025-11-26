import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { aggregateNews } from "$lib/services/news-aggregator";

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { sources, userId, stockSymbols } = body;

		if (!sources || !Array.isArray(sources) || sources.length === 0) {
			return json(
				{ success: false, error: "Sources array is required" },
				{ status: 400 }
			);
		}

		// Fetch news from Grok API and store in Firestore
		const newsItems = await aggregateNews(sources, userId, stockSymbols);

		return json({
			success: true,
			data: {
				items: newsItems,
				count: newsItems.length,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error fetching news:", error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch news",
			},
			{ status: 500 }
		);
	}
};

