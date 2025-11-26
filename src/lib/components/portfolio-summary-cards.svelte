<script lang="ts">
	import type { PortfolioSummary } from "$lib/types/trade";
	import TrendingUp from "~icons/lucide/trending-up";
	import TrendingDown from "~icons/lucide/trending-down";
	import DollarSign from "~icons/lucide/dollar-sign";
	import Target from "~icons/lucide/target";
	import Calendar from "~icons/lucide/calendar";
	import Percent from "~icons/lucide/percent";

	let { summary }: { summary: PortfolioSummary } = $props();

	function formatCurrency(value: number): string {
		if (value >= 10000000) {
			return `₹${(value / 10000000).toFixed(2)}Cr`;
		}
		if (value >= 100000) {
			return `₹${(value / 100000).toFixed(2)}L`;
		}
		return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
	}

	function formatNumber(value: number): string {
		return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
	}

	function getPnlColor(value: number): string {
		return value >= 0 ? "text-[#8CFF88]" : "text-[#FFA8A8]";
	}

	function getPnlBgColor(value: number): string {
		return value >= 0
			? "bg-[rgba(0,143,29,0.25)] text-[#8CFF88]"
			: "bg-[rgba(143,0,0,0.25)] text-[#FFA8A8]";
	}
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
	<!-- Total P&L -->
	<div class="rounded-xl border border-white/10 bg-black/70 p-4 shadow-sm">
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs uppercase tracking-wider text-white/50">Total P&L</p>
			<DollarSign class="size-4 text-white/40" />
		</div>
		<p class={`mb-1 text-2xl font-semibold ${getPnlColor(summary.totalPnl)}`}>
			{formatCurrency(summary.totalPnl)}
		</p>
		<div class="flex items-center gap-2 text-xs text-white/60">
			<span>Realized: {formatCurrency(summary.realizedPnl)}</span>
			<span>•</span>
			<span>Unrealized: {formatCurrency(summary.unrealizedPnl)}</span>
		</div>
	</div>

	<!-- Portfolio Value -->
	<div class="rounded-xl border border-white/10 bg-black/70 p-4 shadow-sm">
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs uppercase tracking-wider text-white/50">Portfolio Value</p>
			<Target class="size-4 text-white/40" />
		</div>
		<p class="mb-1 text-2xl font-semibold text-white">
			{formatCurrency(summary.portfolioValue)}
		</p>
		<div class="flex items-center gap-2 text-xs text-white/60">
			<span>Investment: {formatCurrency(summary.totalInvestment)}</span>
		</div>
	</div>

	<!-- Returns -->
	<div class="rounded-xl border border-white/10 bg-black/70 p-4 shadow-sm">
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs uppercase tracking-wider text-white/50">Returns</p>
			<Percent class="size-4 text-white/40" />
		</div>
		<p class={`mb-1 text-2xl font-semibold ${getPnlColor(summary.returns)}`}>
			{summary.returns >= 0 ? "+" : ""}
			{formatNumber(summary.returns)}%
		</p>
		<div class="flex items-center gap-2 text-xs text-white/60">
			{#if summary.returns >= 0}
				<TrendingUp class="size-3" />
			{:else}
				<TrendingDown class="size-3" />
			{/if}
			<span>Portfolio performance</span>
		</div>
	</div>

	<!-- Win Rate -->
	<div class="rounded-xl border border-white/10 bg-black/70 p-4 shadow-sm">
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs uppercase tracking-wider text-white/50">Win Rate</p>
			<Target class="size-4 text-white/40" />
		</div>
		<p class="mb-1 text-2xl font-semibold text-white">{formatNumber(summary.winRate)}%</p>
		<div class="flex items-center gap-2 text-xs text-white/60">
			<span>{summary.winningTrades}W / {summary.losingTrades}L</span>
			<span>•</span>
			<span>{summary.totalTrades} trades</span>
		</div>
	</div>

	<!-- Average Holding Period -->
	<div class="rounded-xl border border-white/10 bg-black/70 p-4 shadow-sm">
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs uppercase tracking-wider text-white/50">Avg Holding</p>
			<Calendar class="size-4 text-white/40" />
		</div>
		<p class="mb-1 text-2xl font-semibold text-white">
			{formatNumber(summary.avgHoldingPeriod)}
		</p>
		<div class="flex items-center gap-2 text-xs text-white/60">
			<span>Days per trade</span>
		</div>
	</div>
</div>

