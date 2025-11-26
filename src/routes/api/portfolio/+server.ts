import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchPortfolioSummary } from "$lib/services/portfolio-service";

export const GET: RequestHandler = async () => {
	try {
		const summary = fetchPortfolioSummary();
		return json({ success: true, data: summary });
	} catch (error) {
		console.error("Error fetching portfolio summary:", error);
		return json({ success: false, error: "Failed to fetch portfolio summary" }, { status: 500 });
	}
};

