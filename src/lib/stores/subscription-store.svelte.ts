import type { Subscription, SubscriptionPlan, BillingHistoryItem } from "$lib/types/subscription";

const DEFAULT_PLAN: SubscriptionPlan = {
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
};

class SubscriptionStore {
	private _subscription = $state<Subscription | null>(null);
	private _billingHistory = $state<BillingHistoryItem[]>([]);
	private _loading = $state(false);

	get subscription() {
		return this._subscription;
	}

	get billingHistory() {
		return this._billingHistory;
	}

	get loading() {
		return this._loading;
	}

	get isSubscribed() {
		return this._subscription?.status === "active";
	}

	get plan() {
		return DEFAULT_PLAN;
	}

	async subscribe(): Promise<Subscription> {
		this._loading = true;
		try {
			// Mock subscription creation
			const now = new Date();
			const endDate = new Date(now);
			endDate.setMonth(endDate.getMonth() + 1);

			const newSubscription: Subscription = {
				id: `sub_${Date.now()}`,
				status: "active",
				plan: DEFAULT_PLAN,
				startDate: now.toISOString(),
				endDate: endDate.toISOString(),
				cancelAtPeriodEnd: false,
				currentPeriodEnd: endDate.toISOString(),
			};

			this._subscription = newSubscription;

			// Add initial billing history entry
			const billingItem: BillingHistoryItem = {
				id: `inv_${Date.now()}`,
				date: now.toISOString(),
				amount: DEFAULT_PLAN.price,
				status: "paid",
				description: `Subscription to ${DEFAULT_PLAN.name} plan`,
			};

			this._billingHistory = [billingItem, ...this._billingHistory];

			return newSubscription;
		} finally {
			this._loading = false;
		}
	}

	async cancelSubscription(): Promise<void> {
		this._loading = true;
		try {
			if (this._subscription) {
				this._subscription = {
					...this._subscription,
					cancelAtPeriodEnd: true,
				};
			}
		} finally {
			this._loading = false;
		}
	}

	async reactivateSubscription(): Promise<void> {
		this._loading = true;
		try {
			if (this._subscription) {
				this._subscription = {
					...this._subscription,
					cancelAtPeriodEnd: false,
				};
			}
		} finally {
			this._loading = false;
		}
	}

	async getBillingHistory(): Promise<BillingHistoryItem[]> {
		this._loading = true;
		try {
			// Mock billing history - in real implementation, this would fetch from API
			if (this._billingHistory.length === 0 && this._subscription) {
				// Generate mock history
				const history: BillingHistoryItem[] = [];
				const now = new Date();
				
				for (let i = 0; i < 3; i++) {
					const date = new Date(now);
					date.setMonth(date.getMonth() - i);
					
					history.push({
						id: `inv_${Date.now()}_${i}`,
						date: date.toISOString(),
						amount: DEFAULT_PLAN.price,
						status: "paid",
						description: `Subscription to ${DEFAULT_PLAN.name} plan`,
					});
				}
				
				this._billingHistory = history;
			}
			return this._billingHistory;
		} finally {
			this._loading = false;
		}
	}

	async loadSubscription(): Promise<void> {
		this._loading = true;
		try {
			// In real implementation, this would fetch from API
			// For now, we'll keep the mock state
			// The subscription state is managed locally for UI-only implementation
		} finally {
			this._loading = false;
		}
	}
}

// Create singleton instance
let subscriptionStoreInstance: SubscriptionStore | null = null;

export function getSubscriptionStore(): SubscriptionStore {
	if (!subscriptionStoreInstance) {
		subscriptionStoreInstance = new SubscriptionStore();
	}
	return subscriptionStoreInstance;
}

// Export for use in components
export const subscriptionStore = getSubscriptionStore();

