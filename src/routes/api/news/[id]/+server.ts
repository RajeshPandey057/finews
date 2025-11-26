import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchNewsDetail } from "$lib/services/news-service";

export const GET: RequestHandler = async ({ params, url, request }) => {
	try {
		const { id } = params;
		
		// Extract userId from query params or headers (temporary - should use proper auth)
		const userId = url.searchParams.get("userId") || request.headers.get("x-user-id") || undefined;
		
		const detail = await fetchNewsDetail(id, userId || undefined);

		if (!detail) {
			return json({ success: false, error: "News item not found" }, { status: 404 });
		}

		return json({ success: true, data: detail });
	} catch (error) {
		console.error("Error fetching news detail:", error);
		return json({ success: false, error: "Failed to fetch news detail" }, { status: 500 });
	}
};

