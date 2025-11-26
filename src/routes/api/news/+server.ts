import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchNews } from "$lib/services/news-service";

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
		const channelsParam = url.searchParams.get("channels");
		const channels = channelsParam ? channelsParam.split(",") : [];
		
		// Extract userId from query params or headers (temporary - should use proper auth)
		const userId = url.searchParams.get("userId") || request.headers.get("x-user-id") || undefined;

		const news = await fetchNews(channels, date, userId || undefined);

		return json({ success: true, data: news });
	} catch (error) {
		console.error("Error fetching news:", error);
		return json({ success: false, error: "Failed to fetch news" }, { status: 500 });
	}
};

