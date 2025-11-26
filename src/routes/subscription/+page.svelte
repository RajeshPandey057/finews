<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import SEO from "@/components/seo.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { subscriptionStore } from "$lib/stores/subscription-store.svelte";
	import { toast } from "svelte-sonner";
	import CheckIcon from "~icons/lucide/check";
	import CalendarIcon from "~icons/lucide/calendar";
	import CreditCardIcon from "~icons/lucide/credit-card";
	import AlertTriangleIcon from "~icons/lucide/alert-triangle";

	const gradientBackground =
		"radial-gradient(circle at 25% 10%, rgba(255,255,255,0.08), rgba(8,8,8,0.9)), linear-gradient(135deg, #040404 0%, #0E0E0E 45%, #020202 100%)";

	const subscription = $derived(subscriptionStore.subscription);
	const billingHistory = $derived(subscriptionStore.billingHistory);
	let loading = $state(false);
	let cancelDialogOpen = $state(false);

	onMount(async () => {
		await loadSubscriptionData();
	});

	async function loadSubscriptionData() {
		loading = true;
		try {
			// Load subscription from API
			await subscriptionStore.loadSubscription();
			
			// Load billing history
			await subscriptionStore.getBillingHistory();
		} catch (error) {
			console.error("Error loading subscription data:", error);
		} finally {
			loading = false;
		}
	}

	async function handleSubscribe() {
		loading = true;
		try {
			await subscriptionStore.subscribe();
			await loadSubscriptionData();
			toast.success("Successfully subscribed to Pro plan!");
		} catch (error) {
			console.error("Error subscribing:", error);
			toast.error("Failed to subscribe. Please try again.");
		} finally {
			loading = false;
		}
	}

	async function handleCancel() {
		loading = true;
		try {
			await subscriptionStore.cancelSubscription();
			toast.success("Subscription will be canceled at the end of the billing period.");
			cancelDialogOpen = false;
		} catch (error) {
			console.error("Error canceling subscription:", error);
			toast.error("Failed to cancel subscription. Please try again.");
		} finally {
			loading = false;
		}
	}

	async function handleReactivate() {
		loading = true;
		try {
			await subscriptionStore.reactivateSubscription();
			toast.success("Subscription reactivated!");
		} catch (error) {
			console.error("Error reactivating subscription:", error);
			toast.error("Failed to reactivate subscription. Please try again.");
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	}

	const plan = subscriptionStore.plan;
	const isSubscribed = subscription?.status === "active";
	const isCanceling = subscription?.cancelAtPeriodEnd === true;
</script>

<SEO
	title="Subscription - Polygram"
	description="Manage your Polygram subscription and billing"
/>

<main class="min-h-screen text-white" style={`background:${gradientBackground};`}>
	<div class="mx-auto flex min-h-screen max-w-[1512px] flex-col md:flex-row">
		<!-- Sidebar -->
		<aside class="flex w-full flex-row gap-4 border-b border-white/5 px-4 py-4 md:w-[248px] md:flex-col md:border-b-0 md:border-r md:px-3 md:py-5">
			<!-- Polygram Header -->
			<div class="flex items-center gap-3 px-2 py-2">
				<div class="flex size-10 items-center justify-center rounded-full bg-white/20">
					<!-- Placeholder icon - light gray circle -->
				</div>
				<a href="/" class="flex-1 text-base font-semibold text-white">Polygram</a>
			</div>

			<!-- User Profile Menu - Bottom of Sidebar -->
			<div class="ml-auto border-t border-white/5 pt-2 md:ml-0 md:mt-auto">
				<NavUser />
			</div>
		</aside>

		<!-- Main Content -->
		<section class="flex flex-1 flex-col">
			<header class="flex flex-col gap-4 border-b border-white/5 px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
				<h1 class="text-2xl font-semibold tracking-tight text-white">Subscription</h1>
				<p class="text-sm text-white/60">Manage your subscription and billing information</p>
			</header>

			<div class="flex flex-1 flex-col gap-6 px-4 pb-6 pt-6 md:px-8 md:pb-8 md:pt-6">
				<!-- Current Subscription Status -->
				{#if isSubscribed && subscription}
					<Card.Root class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
						<Card.Header>
							<div class="flex items-center justify-between">
								<div>
									<Card.Title class="text-xl font-semibold text-white">Current Plan</Card.Title>
									<Card.Description class="mt-1 text-sm text-white/60">
										Your active subscription details
									</Card.Description>
								</div>
								<Badge
									variant={isCanceling ? "destructive" : "default"}
									class={isCanceling
										? "bg-red-500/20 text-red-400 border-red-500/30"
										: "bg-green-500/20 text-green-400 border-green-500/30"}
								>
									{isCanceling ? "Canceling" : "Active"}
								</Badge>
							</div>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
								<div>
									<p class="font-semibold text-white">{subscription.plan.name} Plan</p>
									<p class="text-sm text-white/60">
										{formatCurrency(subscription.plan.price)}/{subscription.plan.billingCycle === "monthly" ? "month" : "year"}
									</p>
								</div>
								<div class="text-right">
									<p class="text-sm text-white/60">Renews on</p>
									<p class="font-medium text-white">{formatDate(subscription.currentPeriodEnd)}</p>
								</div>
							</div>

							{#if isCanceling}
								<div class="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
									<AlertTriangleIcon class="mt-0.5 size-5 text-yellow-400" />
									<div class="flex-1">
										<p class="font-medium text-yellow-400">Subscription will cancel</p>
										<p class="mt-1 text-sm text-yellow-400/80">
											Your subscription will remain active until {formatDate(subscription.currentPeriodEnd)}. You'll continue to have access to all features until then.
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										class="border-white/20 bg-white/5 text-white hover:bg-white/10"
										onclick={handleReactivate}
										disabled={loading}
									>
										Reactivate
									</Button>
								</div>
							{:else}
								<Button
									variant="destructive"
									size="sm"
									class="w-full border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
									onclick={() => (cancelDialogOpen = true)}
									disabled={loading}
								>
									Cancel Subscription
								</Button>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Subscription Plan Card -->
				<Card.Root class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
					<Card.Header>
						<Card.Title class="text-xl font-semibold text-white">{plan.name} Plan</Card.Title>
						<Card.Description class="mt-1 text-sm text-white/60">
							Unlock all features with our premium subscription
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="flex items-baseline gap-2">
							<span class="text-4xl font-bold text-white">{formatCurrency(plan.price)}</span>
							<span class="text-white/60">/{plan.billingCycle === "monthly" ? "month" : "year"}</span>
						</div>

						<ul class="space-y-3">
							{#each plan.features as feature}
								<li class="flex items-start gap-3">
									<CheckIcon class="mt-0.5 size-5 shrink-0 text-green-400" />
									<span class="text-white/80">{feature}</span>
								</li>
							{/each}
						</ul>

						{#if !isSubscribed}
							<Button
								variant="default"
								size="lg"
								class="w-full bg-white text-black hover:bg-white/90"
								onclick={handleSubscribe}
								disabled={loading}
							>
								<CreditCardIcon class="size-4" />
								Subscribe for {formatCurrency(plan.price)}/{plan.billingCycle === "monthly" ? "month" : "year"}
							</Button>
						{:else}
							<Button
								variant="outline"
								size="lg"
								class="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
								disabled
							>
								<CheckIcon class="size-4" />
								Current Plan
							</Button>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Billing History -->
				<Card.Root class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
					<Card.Header>
						<Card.Title class="text-xl font-semibold text-white">Billing History</Card.Title>
						<Card.Description class="mt-1 text-sm text-white/60">
							View your past transactions and invoices
						</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if billingHistory.length === 0}
							<div class="py-8 text-center text-white/50">
								<CalendarIcon class="mx-auto mb-2 size-8" />
								<p>No billing history available</p>
							</div>
						{:else}
							<div class="overflow-x-auto">
								<Table.Root>
									<Table.Header>
										<Table.Row class="border-white/10">
											<Table.Head class="text-white/60">Date</Table.Head>
											<Table.Head class="text-white/60">Description</Table.Head>
											<Table.Head class="text-white/60">Amount</Table.Head>
											<Table.Head class="text-white/60">Status</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each billingHistory as item}
											<Table.Row class="border-white/5">
												<Table.Cell class="text-white/80">{formatDate(item.date)}</Table.Cell>
												<Table.Cell class="text-white/80">{item.description}</Table.Cell>
												<Table.Cell class="font-medium text-white">{formatCurrency(item.amount)}</Table.Cell>
												<Table.Cell>
													<Badge
														variant={item.status === "paid" ? "default" : item.status === "pending" ? "secondary" : "destructive"}
														class={item.status === "paid"
															? "bg-green-500/20 text-green-400 border-green-500/30"
															: item.status === "pending"
																? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
																: "bg-red-500/20 text-red-400 border-red-500/30"}
													>
														{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
													</Badge>
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</section>
	</div>
</main>

<!-- Cancel Confirmation Dialog -->
{#if cancelDialogOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={() => (cancelDialogOpen = false)}
		role="button"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === "Escape") cancelDialogOpen = false;
		}}
	>
		<div
			class="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-lg"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
		>
			<h3 class="mb-2 text-lg font-semibold text-white">Cancel Subscription?</h3>
			<p class="mb-6 text-sm text-white/60">
				Your subscription will remain active until the end of your current billing period. You'll continue to have access to all features until then.
			</p>
			<div class="flex gap-3">
				<Button
					variant="outline"
					class="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
					onclick={() => (cancelDialogOpen = false)}
				>
					Keep Subscription
				</Button>
				<Button
					variant="destructive"
					class="flex-1 border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
					onclick={handleCancel}
					disabled={loading}
				>
					Cancel Subscription
				</Button>
			</div>
		</div>
	</div>
{/if}

