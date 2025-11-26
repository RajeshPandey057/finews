<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import SEO from "@/components/seo.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import PortfolioSummaryCards from "$lib/components/portfolio-summary-cards.svelte";
	import TradesTable from "$lib/components/trades-table.svelte";
	import PositionsTable from "$lib/components/positions-table.svelte";
	import AddTradeModal from "$lib/components/add-trade-modal.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import TrendingUp from "~icons/lucide/trending-up";
	import Bookmark from "~icons/lucide/bookmark";
	import RadioSignal from "~icons/lucide/radio";
	import Plus from "~icons/lucide/plus";
	import type { Trade, Position, PortfolioSummary } from "$lib/types/trade";

	const gradientBackground =
		"radial-gradient(circle at 25% 10%, rgba(255,255,255,0.08), rgba(8,8,8,0.9)), linear-gradient(135deg, #040404 0%, #0E0E0E 45%, #020202 100%)";

	const navItems = [
		{
			label: "News tracker",
			icon: RadioSignal,
			href: "/",
			isActive: $page.url.pathname === "/",
		},
		{
			label: "Watchlist",
			icon: Bookmark,
			href: "/watchlist",
			isActive: $page.url.pathname === "/watchlist",
		},
		{
			label: "Trades",
			icon: TrendingUp,
			href: "/trades",
			isActive: $page.url.pathname === "/trades",
		},
	];

	let portfolioSummary = $state<PortfolioSummary | null>(null);
	let trades = $state<Trade[]>([]);
	let positions = $state<Position[]>([]);
	let loading = $state(true);
	let addTradeModalOpen = $state(false);
	let activeTab = $state<string>("positions");
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<"asc" | "desc">("asc");

	async function fetchData() {
		loading = true;
		try {
			// Fetch portfolio summary
			const portfolioResponse = await fetch("/api/portfolio");
			if (portfolioResponse.ok) {
				const portfolioResult = await portfolioResponse.json();
				if (portfolioResult.success) {
					portfolioSummary = portfolioResult.data;
				}
			}

			// Fetch trades
			const tradesResponse = await fetch("/api/trades");
			if (tradesResponse.ok) {
				const tradesResult = await tradesResponse.json();
				if (tradesResult.success) {
					trades = tradesResult.data || [];
				}
			}

			// Fetch positions
			const positionsResponse = await fetch("/api/positions");
			if (positionsResponse.ok) {
				const positionsResult = await positionsResponse.json();
				if (positionsResult.success) {
					positions = positionsResult.data || [];
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			// Set defaults to prevent rendering errors
			trades = [];
			positions = [];
		} finally {
			loading = false;
		}
	}

	async function handleAddTrade(tradeData: any) {
		try {
			const response = await fetch("/api/trades", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(tradeData),
			});

			if (response.ok) {
				await fetchData();
			}
		} catch (error) {
			console.error("Error adding trade:", error);
		}
	}

	async function handleDeleteTrade(id: string) {
		try {
			const response = await fetch("/api/trades", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (response.ok) {
				await fetchData();
			}
		} catch (error) {
			console.error("Error deleting trade:", error);
		}
	}

	function handlePositionClick(symbol: string) {
		goto(`/stocks/${symbol}?return=${encodeURIComponent("/trades")}`);
	}

	onMount(() => {
		fetchData();
	});
</script>

<SEO
	title="Trades & Portfolio - Polygram"
	description="View your trading portfolio, positions, and trade history"
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
				<div class="flex-1 text-base font-semibold text-white">Polygram</div>
			</div>

			<!-- Navigation -->
			<nav class="flex items-center gap-2 md:mt-2 md:flex-col md:items-stretch md:space-y-2 md:gap-0">
				{#each navItems as item (item.label)}
					{@const Icon = item.icon}
					<a
						href={item.href}
						class={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition ${
							item.isActive
								? "border-white/15 bg-white/10 text-white"
								: "border-transparent bg-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white/90"
						}`}
					>
						<Icon class="size-4" />
						<span class="truncate">{item.label}</span>
					</a>
				{/each}
			</nav>

			<!-- User Profile Menu - Bottom of Sidebar -->
			<div class="mt-auto border-t border-white/5 pt-2 md:mt-auto">
				<NavUser />
			</div>
		</aside>

		<!-- Main Content -->
		<section class="flex flex-1 flex-col">
			<header class="flex flex-col gap-4 border-b border-white/5 px-4 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-8 md:pb-6 md:pt-8">
				<h1 class="text-2xl font-semibold tracking-tight text-white">Trades & Portfolio</h1>
				<Button
					variant="ghost"
					size="sm"
					class="self-start rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
					onclick={() => (addTradeModalOpen = true)}
				>
					<Plus class="size-4" />
					Add Trade
				</Button>
			</header>

			<div class="flex flex-1 flex-col gap-6 px-4 pb-6 pt-6 md:px-8 md:pb-8 md:pt-6">
				{#if loading}
					<div class="flex flex-1 items-center justify-center">
						<p class="text-white/70">Loading portfolio data...</p>
					</div>
				{:else if portfolioSummary}
					<!-- Portfolio Summary Cards -->
					<PortfolioSummaryCards summary={portfolioSummary} />

					<!-- Tabs for Positions and Trades -->
					<Tabs.Root bind:value={activeTab} class="w-full">
						<Tabs.List class="grid w-full grid-cols-2 border-b border-white/10">
							<Tabs.Trigger
								value="positions"
								class="data-[state=active]:border-b-2 data-[state=active]:border-white/20 data-[state=active]:text-white text-white/60"
							>
								Positions ({positions.length})
							</Tabs.Trigger>
							<Tabs.Trigger
								value="trades"
								class="data-[state=active]:border-b-2 data-[state=active]:border-white/20 data-[state=active]:text-white text-white/60"
							>
								All Trades ({trades.length})
							</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="positions" class="mt-6">
							<PositionsTable
								{positions}
								onRowClick={handlePositionClick}
								bind:sortColumn
								bind:sortDirection
							/>
						</Tabs.Content>

						<Tabs.Content value="trades" class="mt-6">
							<TradesTable
								{trades}
								onDelete={handleDeleteTrade}
								bind:sortColumn
								bind:sortDirection
							/>
						</Tabs.Content>
					</Tabs.Root>
				{:else}
					<div class="flex flex-1 flex-col items-center justify-center gap-4">
						<TrendingUp class="size-16 text-white/30" />
						<p class="text-lg font-medium text-white/70">No portfolio data available</p>
						<p class="text-sm text-white/50">Add your first trade to get started</p>
						<Button
							onclick={() => (addTradeModalOpen = true)}
							class="mt-2 bg-white/10 text-white hover:bg-white/20"
						>
							<Plus class="size-4" />
							Add Trade
						</Button>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>

<!-- Add Trade Modal -->
<AddTradeModal bind:open={addTradeModalOpen} onSave={handleAddTrade} />

