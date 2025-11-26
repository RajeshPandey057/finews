<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import SEO from "@/components/seo.svelte";
	import NewsConfigPanel from "$lib/components/news-config-panel.svelte";
	import NewsDetailPanel from "$lib/components/news-detail-panel.svelte";
	import ChatSidebar from "$lib/components/chat-sidebar.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import ArrowLeft from "~icons/lucide/arrow-left";
	import ArrowRight from "~icons/lucide/arrow-right";
	import Calendar from "~icons/lucide/calendar";
	import RefreshCcw from "~icons/lucide/refresh-ccw";
	import RadioSignal from "~icons/lucide/radio";
	import Send from "~icons/lucide/send-horizontal";
	import Settings from "~icons/lucide/settings";
	import Bookmark from "~icons/lucide/bookmark";
	import TrendingUp from "~icons/lucide/trending-up";
	import { page } from "$app/stores";
	import ChevronUp from "~icons/lucide/chevron-up";
	import ChevronDown from "~icons/lucide/chevron-down";
	import type { NewsItem, NewsDetail, TrackerConfig } from "$lib/types/news";
	import { getConfig } from "$lib/services/config-service";
	import { onMount } from "svelte";

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

	const gradientBackground =
		"radial-gradient(circle at 25% 10%, rgba(255,255,255,0.08), rgba(8,8,8,0.9)), linear-gradient(135deg, #040404 0%, #0E0E0E 45%, #020202 100%)";

	let configOpen = $state(false);
	let detailPanelOpen = $state(false);
	let selectedNewsDetail = $state<NewsDetail | null>(null);
	let newsItems = $state<NewsItem[]>([]);
	let config = $state<TrackerConfig>(getConfig());
	let selectedDate = $state(new Date());
	let lastUpdated = $state(new Date());
	let loading = $state(false);
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<"asc" | "desc">("asc");
	let aiInput = $state("");
	let chatSidebarOpen = $state(false);
	let initialChatMessage = $state("");

	function formatDate(date: Date): string {
		const day = date.getDate();
		const month = date.toLocaleDateString("en-US", { month: "short" });
		const year = date.getFullYear();
		const suffix = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
		return `${day}${suffix} ${month} ${year}`;
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	}

	async function fetchNews() {
		loading = true;
		try {
			const enabledChannels = config.channels
				.filter((c) => c.enabled)
				.map((c) => c.name);
			const dateStr = selectedDate.toISOString().split("T")[0];
			const channelsParam = enabledChannels.join(",");

			const response = await fetch(
				`/api/news?date=${dateStr}&channels=${channelsParam}`
			);
			const result = await response.json();

			if (result.success) {
				newsItems = result.data;
				lastUpdated = new Date();
			}
		} catch (error) {
			console.error("Error fetching news:", error);
		} finally {
			loading = false;
		}
	}

	async function fetchNewsDetail(id: string) {
		try {
			const response = await fetch(`/api/news/${id}`);
			const result = await response.json();

			if (result.success) {
				selectedNewsDetail = result.data;
				detailPanelOpen = true;
			}
		} catch (error) {
			console.error("Error fetching news detail:", error);
		}
	}

	function handleRowClick(item: NewsItem) {
		fetchNewsDetail(item.id);
	}

	function handleSort(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortColumn = column;
			sortDirection = "asc";
		}

		const sorted = [...newsItems].sort((a, b) => {
			let aVal: string | number;
			let bVal: string | number;

			switch (column) {
				case "Script":
					aVal = a.code;
					bVal = b.code;
					break;
				case "Source":
					aVal = a.source;
					bVal = b.source;
					break;
				case "CMP ₹":
					aVal = a.cmp;
					bVal = b.cmp;
					break;
				case "1D Change":
					aVal = a.change;
					bVal = b.change;
					break;
				case "Confidence":
					const confOrder = { High: 3, Medium: 2, Low: 1 };
					aVal = confOrder[a.confidence] || 0;
					bVal = confOrder[b.confidence] || 0;
					break;
				default:
					return 0;
			}

			if (typeof aVal === "string" && typeof bVal === "string") {
				return sortDirection === "asc"
					? aVal.localeCompare(bVal)
					: bVal.localeCompare(aVal);
			}

			return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
		});

		newsItems = sorted;
	}

	function goToPreviousDay() {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() - 1);
		selectedDate = newDate;
		fetchNews();
	}

	function goToNextDay() {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);
		selectedDate = newDate;
		fetchNews();
	}

	function handleRefresh() {
		fetchNews();
	}

	onMount(() => {
		fetchNews();

		// Listen for config updates
		window.addEventListener("config-updated", () => {
			config = getConfig();
			fetchNews();
		});
	});
</script>

<SEO
	title="Latest Financial News & AI Insights"
	description="Stay updated with the latest financial news, market trends, and AI-powered analysis. Polygram delivers expert coverage on stocks, investments, and global finance."
	image="/images/financial-news/ai-insights.webp"
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

		<!-- Primary content -->
		<section class="flex flex-1 flex-col">
			<header class="flex flex-col gap-4 border-b border-white/5 px-4 pb-4 pt-6 md:flex-row md:items-center md:justify-between md:px-8 md:pb-6 md:pt-8">
				<h1 class="text-2xl font-semibold tracking-tight text-white">News Tracker</h1>
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
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div class="flex flex-wrap gap-3">
						<button
							type="button"
							onclick={goToPreviousDay}
							class="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
							aria-label="Go back a day"
						>
							<ArrowLeft class="size-4" />
						</button>
						<button
							type="button"
							class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
						>
							<Calendar class="size-4 text-white/70" />
							{formatDate(selectedDate)}
						</button>
						<button
							type="button"
							onclick={goToNextDay}
							class="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
							aria-label="Go forward a day"
						>
							<ArrowRight class="size-4" />
						</button>
					</div>
					<div class="flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center md:gap-4">
						<p>Last Updated: {formatTime(lastUpdated)}</p>
						<button
							type="button"
							onclick={handleRefresh}
							disabled={loading}
							class="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:opacity-50"
							aria-label="Refresh data"
						>
							<RefreshCcw class="size-4 {loading ? 'animate-spin' : ''}" />
						</button>
					</div>
				</div>

				<div class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
					<div class="overflow-x-auto">
						<table class="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-sm">
							<thead class="text-xs uppercase tracking-[0.08em] text-white/50">
								<tr>
									{#each [
										{ name: "Script", sortable: true },
										{ name: "Headlines", sortable: false },
										{ name: "Source", sortable: true },
										{ name: "CMP ₹", sortable: true },
										{ name: "PE", sortable: false },
										{ name: "1D Change", sortable: true },
										{ name: "Confidence", sortable: true },
									] as column}
										<th
											class="border-b border-white/10 px-3 py-3 text-left font-medium first:rounded-tl-2xl last:rounded-tr-2xl {column.sortable
												? "cursor-pointer select-none hover:bg-white/5"
												: ""}"
											onclick={() => column.sortable && handleSort(column.name)}
										>
											<div class="flex items-center gap-1">
												{column.name}
												{#if column.sortable && sortColumn === column.name}
													{#if sortDirection === "asc"}
														<ChevronUp class="size-3" />
													{:else}
														<ChevronDown class="size-3" />
													{/if}
												{/if}
											</div>
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#if loading && newsItems.length === 0}
									<tr>
										<td colspan="7" class="px-3 py-8 text-center text-white/50">
											Loading news...
										</td>
									</tr>
								{:else if newsItems.length === 0}
									<tr>
										<td colspan="7" class="px-3 py-8 text-center text-white/50">
											No news found for the selected date and channels.
										</td>
									</tr>
								{:else}
									{#each newsItems as item (item.id)}
										<tr
											class="cursor-pointer border-b border-white/5 transition hover:bg-white/5 last:border-b-0"
											onclick={() => handleRowClick(item)}
										>
											<td class="px-3 py-4">
												<p class="text-base font-semibold tracking-tight text-white">
													{item.code}
												</p>
												<p class="text-xs text-white/50">{item.name}</p>
											</td>
											<td class="px-3 py-4 text-white/80">{item.headline}</td>
											<td class="px-3 py-4 font-semibold text-white/80">
												{item.source}
											</td>
											<td class="px-3 py-4 font-semibold text-white/80">
												₹{item.cmp.toLocaleString()}
											</td>
											<td class="px-3 py-4">
												<div class="space-y-1">
													<p class="font-medium text-white/80">{item.pe}</p>
													<div class="h-1 w-full rounded-full bg-white/10">
														<div
															class="h-full rounded-full bg-white/60"
															style={`width: ${Math.min((item.pe / 50) * 100, 100)}%`}
														></div>
													</div>
												</div>
											</td>
											<td class="px-3 py-4">
												<span
													class={`inline-flex min-w-[80px] items-center justify-center rounded-md px-3 py-1 text-sm font-semibold tracking-tight ${
														item.changeTone === "positive"
															? "bg-[rgba(0,143,29,0.25)] text-[#8CFF88]"
															: "bg-[rgba(143,0,0,0.25)] text-[#FFA8A8]"
													}`}
												>
													{item.changeTone === "positive" ? "+" : ""}
													{item.change.toFixed(1)}%
												</span>
											</td>
											<td class="px-3 py-4">
												<span
													class="inline-flex min-w-[80px] items-center justify-center rounded-md bg-[rgba(0,133,143,0.25)] px-3 py-1 text-sm font-semibold text-[#88FFFB]"
												>
													{item.confidence}
												</span>
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<div class="mt-auto flex justify-end px-4 pb-10 md:px-8">
				<div
					class="flex w-full max-w-md items-center rounded-xl border border-white/15 bg-[#2e2e2e] px-4 py-3 text-sm text-white/60 shadow-lg md:w-[356px] md:px-6"
				>
					<input
						bind:value={aiInput}
						type="text"
						placeholder="Ask AI about today's news"
						class="flex-1 border-0 bg-transparent text-white placeholder:text-white/50 focus:outline-none"
						onkeydown={(e) => {
							if (e.key === "Enter" && !e.shiftKey && aiInput.trim()) {
								e.preventDefault();
								initialChatMessage = aiInput.trim();
								aiInput = "";
								chatSidebarOpen = true;
							}
						}}
					/>
					<button
						type="button"
						onclick={() => {
							if (aiInput.trim()) {
								initialChatMessage = aiInput.trim();
								aiInput = "";
								chatSidebarOpen = true;
							}
						}}
						disabled={!aiInput.trim()}
						class="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Send prompt"
					>
						<Send class="size-4" />
					</button>
				</div>
			</div>
		</section>
	</div>
</main>

<!-- Configuration Panel -->
<NewsConfigPanel bind:open={configOpen} bind:config />

<!-- News Detail Panel -->
<NewsDetailPanel bind:open={detailPanelOpen} detail={selectedNewsDetail} />

<!-- Chat Sidebar -->
<ChatSidebar bind:open={chatSidebarOpen} initialMessage={initialChatMessage} />
