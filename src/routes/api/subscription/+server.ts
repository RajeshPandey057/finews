import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { Subscription } from "$lib/types/subscription";

// Mock subscription data - in production, this would come from a database/Stripe
let mockSubscription: Subscription | null = null;

export const GET: RequestHandler = async () => {
	try {
		// In production, fetch from database/Stripe based on authenticated user
		return json({ success: true, data: mockSubscription });
	} catch (error) {
		console.error("Error fetching subscription:", error);
		return json({ success: false, error: "Failed to fetch subscription" }, { status: 500 });
	}
};

export const POST: RequestHandler = async () => {
	try {
		// Mock subscription creation
		const now = new Date();
		const endDate = new Date(now);
		endDate.setMonth(endDate.getMonth() + 1);

		const newSubscription: Subscription = {
			id: `sub_${Date.now()}`,
			status: "active",
			plan: {
				id: "pro-monthly",
				name: "Pro",
				price: 10,
				billingCycle: "monthly",
				features: [
					"Unlimited news tracking",
					"AI-powered insights",
					"Real-time market data",
					"Advanced analytics",
					"Priority support",
				],
			},
			startDate: now.toISOString(),
			endDate: endDate.toISOString(),
			cancelAtPeriodEnd: false,
			currentPeriodEnd: endDate.toISOString(),
		};

		mockSubscription = newSubscription;

		// In production, create subscription in Stripe and save to database
		return json({ success: true, data: newSubscription });
	} catch (error) {
		console.error("Error creating subscription:", error);
		return json({ success: false, error: "Failed to create subscription" }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async () => {
	try {
		if (!mockSubscription) {
			return json({ success: false, error: "No active subscription found" }, { status: 404 });
		}

		// Set cancelAtPeriodEnd to true instead of immediately canceling
		mockSubscription = {
			...mockSubscription,
			cancelAtPeriodEnd: true,
		};

		// In production, cancel subscription in Stripe and update database
		return json({ success: true, data: mockSubscription });
	} catch (error) {
		console.error("Error canceling subscription:", error);
		return json({ success: false, error: "Failed to cancel subscription" }, { status: 500 });
	}
};

