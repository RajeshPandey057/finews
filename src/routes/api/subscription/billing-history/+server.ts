import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { BillingHistoryItem } from "$lib/types/subscription";

export const GET: RequestHandler = async () => {
	try {
		// Mock billing history - in production, fetch from database/Stripe
		const now = new Date();
		const mockHistory: BillingHistoryItem[] = [];

		// Generate 3 months of billing history if subscription exists
		for (let i = 0; i < 3; i++) {
			const date = new Date(now);
			date.setMonth(date.getMonth() - i);

			mockHistory.push({
				id: `inv_${Date.now()}_${i}`,
				date: date.toISOString(),
				amount: 10,
				status: "paid",
				description: "Subscription to Pro plan",
			});
		}

		return json({ success: true, data: mockHistory });
	} catch (error) {
		console.error("Error fetching billing history:", error);
		return json({ success: false, error: "Failed to fetch billing history" }, { status: 500 });
	}
};

