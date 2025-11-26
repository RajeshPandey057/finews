<script lang="ts">
	import { goto } from "$app/navigation";
	import CreditCardIcon from "@tabler/icons-svelte/icons/credit-card";
	import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
	import LogoutIcon from "@tabler/icons-svelte/icons/logout";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { authStore } from "$lib/stores/auth-store.svelte";
	import { subscriptionStore } from "$lib/stores/subscription-store.svelte";

	let { user }: { user?: { name: string; email: string; avatar: string } } = $props();
	
	// Use user from props if provided, otherwise get from store
	const currentUser = $derived(user || authStore.user);
	const isAuthenticated = $derived(currentUser !== null);
	const subscription = $derived(subscriptionStore.subscription);
	const isSubscribed = $derived(subscription?.status === "active");

	function handleLogout() {
		authStore.logout();
		// Optionally redirect to login page
		goto("/login");
	}

	function handleBilling() {
		goto("/subscription");
	}
</script>

{#if isAuthenticated && currentUser}
	<!-- Custom sidebar version (for +page.svelte and watchlist/+page.svelte) -->
	<div class="relative">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<button
					class="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:border-white/15 hover:text-white"
				>
					<Avatar.Root class="size-8 rounded-lg">
						<Avatar.Image src={currentUser.avatar} alt={currentUser.name} />
						<Avatar.Fallback class="rounded-lg bg-white/20 text-white">
							{currentUser.name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="grid flex-1 text-start text-sm leading-tight">
						<div class="flex items-center gap-2">
							<span class="truncate font-medium text-white">{currentUser.name}</span>
							{#if isSubscribed}
								<Badge
									variant="default"
									class="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0"
								>
									Pro
								</Badge>
							{/if}
						</div>
						<span class="truncate text-xs text-white/60">
							{currentUser.email}
						</span>
					</div>
					<DotsVerticalIcon class="ms-auto size-4 text-white/60" />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="min-w-56 rounded-lg border border-white/10 bg-black/90 shadow-lg"
				side="top"
				align="start"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={currentUser.avatar} alt={currentUser.name} />
							<Avatar.Fallback class="rounded-lg bg-white/20 text-white">
								{currentUser.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<div class="flex items-center gap-2">
								<span class="truncate font-medium text-white">{currentUser.name}</span>
								{#if isSubscribed}
									<Badge
										variant="default"
										class="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0"
									>
										Pro
									</Badge>
								{/if}
							</div>
							<span class="truncate text-xs text-white/60">
								{currentUser.email}
							</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={handleBilling} class="text-white/80 hover:bg-white/10 hover:text-white">
						<CreditCardIcon class="text-white" />
						Billing
						{#if isSubscribed}
							<Badge
								variant="default"
								class="ml-auto bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0"
							>
								Pro
							</Badge>
						{/if}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleLogout} class="text-red-500 hover:bg-white/10 hover:text-red-400">
					<LogoutIcon class="text-white" />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{:else}
	<!-- Show login button when not authenticated -->
	<div class="px-2 py-2">
		<a
			href="/login"
			class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:border-white/15 hover:text-white"
		>
			<svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
				<path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
				<path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
				<path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65454 3.57955 9 3.57955Z" fill="#EA4335"/>
			</svg>
			<span>Sign in</span>
		</a>
	</div>
{/if}
