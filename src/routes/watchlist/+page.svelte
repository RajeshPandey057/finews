<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import SEO from "@/components/seo.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import Bookmark from "~icons/lucide/bookmark";
	import Trash2 from "~icons/lucide/trash-2";
	import RadioSignal from "~icons/lucide/radio";
	import TrendingUp from "~icons/lucide/trending-up";
	import Settings from "~icons/lucide/settings";
	import { Button } from "$lib/components/ui/button/index.js";
	import WatchlistConfigPanel from "$lib/components/watchlist-config-panel.svelte";
	import { getWatchlistConfig } from "$lib/services/watchlist-config-service";
	import { getWatchlist as getWatchlistFromService } from "$lib/services/watchlist-service";
	import type { WatchlistItem, StockData } from "$lib/types/stock";
	import type { WatchlistTableConfig, WatchlistTableColumn } from "$lib/types/watchlist";

	const gradientBackground =
		"radial-gradient(circle at 25% 10%, rgba(255,255,255,0.08), rgba(8,8,8,0.9)), linear-gradient(135deg, #040404 0%, #0E0E0E 45%, #020202 100%)";

	let watchlistItems = $state<WatchlistItem[]>([]);
	let stockDataMap = $state<Record<string, StockData>>({});
	let loading = $state(true);
	let configOpen = $state(false);
	let config = $state<WatchlistTableConfig>(getWatchlistConfig());

	async function fetchWatchlist() {
		try {
			// Initialize watchlist on client side first (this will add defaults if empty)
			const localWatchlist = getWatchlistFromService();
			
			// Use local watchlist directly (it's already initialized with defaults if needed)
			watchlistItems = localWatchlist;
			
			// Fetch stock data for each item
			for (const item of watchlistItems) {
				try {
					const stockResponse = await fetch(`/api/stocks/${item.symbol}`);
					const stockResult = await stockResponse.json();
					if (stockResult.success) {
						stockDataMap[item.symbol] = stockResult.data;
					}
				} catch (error) {
					console.error(`Error fetching data for ${item.symbol}:`, error);
				}
			}
		} catch (error) {
			console.error("Error fetching watchlist:", error);
		} finally {
			loading = false;
		}
	}

	async function removeFromWatchlist(symbol: string, event: MouseEvent) {
		event.stopPropagation();
		try {
			const response = await fetch("/api/watchlist", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symbol }),
			});

			if (response.ok) {
				watchlistItems = watchlistItems.filter((item) => item.symbol !== symbol);
				delete stockDataMap[symbol];
				window.dispatchEvent(new CustomEvent("watchlist-updated"));
			}
		} catch (error) {
			console.error("Error removing from watchlist:", error);
		}
	}

	function handleRowClick(symbol: string) {
		// Include return URL so back button works correctly
		const currentPath = $page.url.pathname;
		goto(`/stocks/${symbol}?return=${encodeURIComponent(currentPath)}`);
	}

	function formatCurrency(value: number): string {
		return `₹${value.toFixed(2)}`;
	}

	function formatLargeNumber(value: number): string {
		if (value >= 1000000000000) {
			return `₹${(value / 1000000000000).toFixed(2)}L Cr`;
		}
		if (value >= 10000000) {
			return `₹${(value / 10000000).toFixed(2)}Cr`;
		}
		return `₹${value.toLocaleString()}`;
	}

	function formatVolume(volume: number): string {
		if (volume >= 1000000) {
			return `${(volume / 1000000).toFixed(2)}M`;
		}
		if (volume >= 1000) {
			return `${(volume / 1000).toFixed(2)}K`;
		}
		return volume.toString();
	}

	function getColumnValue(
		column: WatchlistTableColumn,
		stockData: StockData | undefined
	): string {
		if (!stockData) return "-";

		const { detail, fundamentals, shareholding, prices } = stockData;
		const detailWith52W = detail as typeof detail & { high52W?: number; low52W?: number };

		switch (column) {
			case "Current Price (CMP)":
				return formatCurrency(detail.currentPrice);
			case "Change":
				return `${detail.change >= 0 ? "+" : ""}${detail.change.toFixed(2)}`;
			case "Change %":
				return `${detail.changePercent >= 0 ? "+" : ""}${detail.changePercent.toFixed(2)}%`;
			case "Market Cap":
				return formatLargeNumber(detail.marketCap);
			case "P/E Ratio":
				return fundamentals.peRatio.toFixed(2);
			case "P/B Ratio":
				return fundamentals.pbRatio.toFixed(2);
			case "EPS":
				return formatCurrency(fundamentals.eps);
			case "ROE":
				return `${fundamentals.roe.toFixed(2)}%`;
			case "ROCE":
				return `${fundamentals.roce.toFixed(2)}%`;
			case "Revenue":
				return formatLargeNumber(fundamentals.revenue);
			case "Profit Margin":
				return `${fundamentals.profitMargin.toFixed(2)}%`;
			case "Promoter %":
				return `${shareholding.promoter.toFixed(1)}%`;
			case "FII %":
				return `${shareholding.fii.toFixed(1)}%`;
			case "DII %":
				return `${shareholding.dii.toFixed(1)}%`;
			case "Public %":
				return `${shareholding.public.toFixed(1)}%`;
			case "Sector":
				return detail.sector;
			case "Industry":
				return detail.industry;
			case "Book Value":
				return formatCurrency(fundamentals.bookValue);
			case "Face Value":
				return formatCurrency(fundamentals.faceValue);
			case "Dividend Yield":
				return `${fundamentals.dividendYield.toFixed(2)}%`;
			case "Beta":
				return fundamentals.beta.toFixed(2);
			case "52W High":
				return detailWith52W.high52W ? formatCurrency(detailWith52W.high52W) : "-";
			case "52W Low":
				return detailWith52W.low52W ? formatCurrency(detailWith52W.low52W) : "-";
			case "Volume":
				const latestPrice = prices[prices.length - 1];
				return latestPrice ? formatVolume(latestPrice.volume) : "-";
			case "Debt-to-Equity Ratio":
				return fundamentals.debtToEquity?.toFixed(2) || "-";
			case "Current Ratio":
				return fundamentals.currentRatio?.toFixed(2) || "-";
			case "Quick Ratio":
				return fundamentals.quickRatio?.toFixed(2) || "-";
			case "Price-to-Sales Ratio":
				return fundamentals.priceToSales?.toFixed(2) || "-";
			case "EV/EBITDA":
				return fundamentals.evEbitda?.toFixed(2) || "-";
			default:
				return "-";
		}
	}

	function getColumnClass(column: WatchlistTableColumn): string {
		if (column.includes("%") || column === "Change" || column === "Change %") {
			return "text-right";
		}
		if (
			column.includes("Price") ||
			column.includes("Cap") ||
			column.includes("Revenue") ||
			column.includes("Value") ||
			column.includes("Ratio") ||
			column.includes("EPS") ||
			column.includes("EV")
		) {
			return "text-right";
		}
		return "text-left";
	}

	onMount(() => {
		fetchWatchlist();

		// Listen for watchlist updates
		window.addEventListener("watchlist-updated", fetchWatchlist);
		
		// Listen for config updates
		const handleConfigUpdate = () => {
			// Reload config from localStorage to ensure we have the latest
			const newConfig = getWatchlistConfig();
			// Force reactivity by creating a new object
			config.selectedColumns = [...newConfig.selectedColumns];
		};
		window.addEventListener("watchlist-config-updated", handleConfigUpdate);
		
		return () => {
			window.removeEventListener("watchlist-updated", fetchWatchlist);
			window.removeEventListener("watchlist-config-updated", handleConfigUpdate);
		};
	});
</script>

<SEO
	title="Watchlist - Polygram"
	description="View and manage your stock watchlist"
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
				<a
					href="/"
					class="flex w-full items-center gap-3 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-white/60 transition hover:border-white/10 hover:bg-white/5 hover:text-white/90"
				>
					<RadioSignal class="size-4" />
					<span>News tracker</span>
				</a>
				<a
					href="/watchlist"
					class="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white"
				>
					<Bookmark class="size-4" />
					<span>Watchlist</span>
				</a>
				<a
					href="/trades"
					class="flex w-full items-center gap-3 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-white/60 transition hover:border-white/10 hover:bg-white/5 hover:text-white/90"
				>
					<TrendingUp class="size-4" />
					<span>Trades</span>
				</a>
			</nav>

			<!-- User Profile Menu - Bottom of Sidebar -->
			<div class="mt-auto border-t border-white/5 pt-2 md:mt-auto">
				<NavUser />
			</div>
		</aside>

		<!-- Main Content -->
		<section class="flex flex-1 flex-col">
			<header class="flex flex-col gap-4 border-b border-white/5 px-4 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-8 md:pb-6 md:pt-8">
				<h1 class="text-2xl font-semibold tracking-tight text-white">Watchlist</h1>
				<Button
					variant="ghost"
					size="sm"
					class="self-start rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
					onclick={() => (configOpen = true)}
				>
					<Settings class="size-4" />
					Configure
				</Button>
			</header>

			<div class="flex flex-1 flex-col gap-6 px-4 pb-6 pt-6 md:px-8 md:pb-8 md:pt-6">
				{#if loading}
					<div class="flex flex-1 items-center justify-center">
						<p class="text-white/70">Loading watchlist...</p>
					</div>
				{:else if watchlistItems.length === 0}
					<div class="flex flex-1 flex-col items-center justify-center gap-4">
						<Bookmark class="size-16 text-white/30" />
						<p class="text-lg font-medium text-white/70">Your watchlist is empty</p>
						<p class="text-sm text-white/50">
							Add stocks to your watchlist to track them here
						</p>
					</div>
				{:else}
					<div class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
						<div class="overflow-x-auto">
							<table class="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-sm">
								<thead class="text-xs uppercase tracking-[0.08em] text-white/50">
									<tr>
										<!-- Always visible columns -->
										<th class="border-b border-white/10 px-3 py-3 text-left font-medium first:rounded-tl-2xl">
											Symbol
										</th>
										<th class="border-b border-white/10 px-3 py-3 text-left font-medium">Name</th>
										
										<!-- Dynamic columns -->
										{#each config.selectedColumns as column}
											<th class="border-b border-white/10 px-3 py-3 {getColumnClass(column)} font-medium">
												{column}
											</th>
										{/each}
										
										<!-- Actions column -->
										<th class="border-b border-white/10 px-3 py-3 text-center font-medium last:rounded-tr-2xl">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{#each watchlistItems as item (item.symbol)}
										{@const stockData = stockDataMap[item.symbol]}
										<tr
											class="cursor-pointer border-b border-white/5 transition hover:bg-white/5 last:border-b-0"
											onclick={() => handleRowClick(item.symbol)}
										>
											<!-- Always visible columns -->
											<td class="px-3 py-4">
												<p class="text-base font-semibold tracking-tight text-white">
													{item.symbol}
												</p>
											</td>
											<td class="px-3 py-4 text-white/80">{item.name}</td>
											
											<!-- Dynamic columns -->
											{#each config.selectedColumns as column}
												{@const value = getColumnValue(column, stockData)}
												{@const isChangeColumn = column === "Change" || column === "Change %"}
												{@const isPositive = stockData && stockData.detail.change >= 0}
												<td class={`px-3 py-4 ${getColumnClass(column)} ${
													isChangeColumn && stockData
														? isPositive
															? "text-[#8CFF88]"
															: "text-[#FFA8A8]"
														: "text-white/80"
												} font-semibold`}>
													{value}
												</td>
											{/each}
											
											<!-- Actions column -->
											<td class="px-3 py-4" onclick={(e) => e.stopPropagation()}>
												<div class="flex items-center justify-center gap-2">
													<button
														type="button"
														onclick={(e) => removeFromWatchlist(item.symbol, e)}
														class="flex size-8 items-center justify-center rounded-lg border border-white/7 bg-white/4 text-red-400/70 transition hover:bg-white/8"
														aria-label="Remove from watchlist"
													>
														<Trash2 class="size-4" />
													</button>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>

<!-- Configuration Panel -->
<WatchlistConfigPanel bind:open={configOpen} bind:config />
