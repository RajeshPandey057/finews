import { onMount } from "svelte";
import type { Subscription } from "$lib/types/subscription";

export interface User {
	name: string;
	email: string;
	avatar: string;
	subscription?: Subscription;
}

class AuthStore {
	private _user = $state<User | null>(null);
	private _isAuthenticated = $derived(this._user !== null);

	get user() {
		return this._user;
	}

	get isAuthenticated() {
		return this._isAuthenticated;
	}

	login(mockUser?: User) {
		// Mock login - sets a default user if none provided
		this._user = mockUser || {
			name: "John Doe",
			email: "john.doe@example.com",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
		};
	}

	logout() {
		this._user = null;
	}
}

// Create singleton instance
let authStoreInstance: AuthStore | null = null;

export function getAuthStore(): AuthStore {
	if (!authStoreInstance) {
		authStoreInstance = new AuthStore();
	}
	return authStoreInstance;
}

// Export for use in components
export const authStore = getAuthStore();

