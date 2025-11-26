import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchPositions } from "$lib/services/trade-service";

export const GET: RequestHandler = async () => {
	try {
		const positions = fetchPositions();
		return json({ success: true, data: positions });
	} catch (error) {
		console.error("Error fetching positions:", error);
		return json({ success: false, error: "Failed to fetch positions" }, { status: 500 });
	}
};

