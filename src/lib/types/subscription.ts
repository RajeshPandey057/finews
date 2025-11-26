export type SubscriptionStatus = "active" | "canceled" | "expired" | "trial";

export interface SubscriptionPlan {
	id: string;
	name: string;
	price: number; // in dollars
	billingCycle: "monthly" | "yearly";
	features: string[];
}

export interface Subscription {
	id: string;
	status: SubscriptionStatus;
	plan: SubscriptionPlan;
	startDate: string; // ISO date string
	endDate: string; // ISO date string
	cancelAtPeriodEnd: boolean;
	currentPeriodEnd: string; // ISO date string
}

export interface BillingHistoryItem {
	id: string;
	date: string; // ISO date string
	amount: number; // in dollars
	status: "paid" | "pending" | "failed";
	description: string;
	invoiceUrl?: string;
}

