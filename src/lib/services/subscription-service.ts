import type { Subscription, BillingHistoryItem } from "$lib/types/subscription";

export async function getSubscription(): Promise<Subscription | null> {
	try {
		const response = await fetch("/api/subscription");
		if (!response.ok) {
			return null;
		}
		const result = await response.json();
		return result.success ? result.data : null;
	} catch (error) {
		console.error("Error fetching subscription:", error);
		return null;
	}
}

export async function createSubscription(): Promise<Subscription> {
	try {
		const response = await fetch("/api/subscription", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!result.success) {
			throw new Error(result.error || "Failed to create subscription");
		}
		return result.data;
	} catch (error) {
		console.error("Error creating subscription:", error);
		throw error;
	}
}

export async function cancelSubscription(): Promise<void> {
	try {
		const response = await fetch("/api/subscription", {
			method: "DELETE",
		});
		const result = await response.json();
		if (!result.success) {
			throw new Error(result.error || "Failed to cancel subscription");
		}
	} catch (error) {
		console.error("Error canceling subscription:", error);
		throw error;
	}
}

export async function getBillingHistory(): Promise<BillingHistoryItem[]> {
	try {
		const response = await fetch("/api/subscription/billing-history");
		if (!response.ok) {
			return [];
		}
		const result = await response.json();
		return result.success ? result.data : [];
	} catch (error) {
		console.error("Error fetching billing history:", error);
		return [];
	}
}

