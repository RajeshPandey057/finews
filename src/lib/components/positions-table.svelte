<script lang="ts">
	import type { Position } from "$lib/types/trade";
	import ChevronUp from "~icons/lucide/chevron-up";
	import ChevronDown from "~icons/lucide/chevron-down";

	let {
		positions,
		onRowClick,
		sortColumn = $bindable(null),
		sortDirection = $bindable<"asc" | "desc">("asc"),
	}: {
		positions: Position[];
		onRowClick?: (symbol: string) => void;
		sortColumn?: string | null;
		sortDirection?: "asc" | "desc";
	} = $props();

	function formatCurrency(value: number): string {
		return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	}

	function getPnlColor(value: number): string {
		return value >= 0 ? "text-[#8CFF88]" : "text-[#FFA8A8]";
	}

	function getPnlBgColor(value: number): string {
		return value >= 0
			? "bg-[rgba(0,143,29,0.25)] text-[#8CFF88]"
			: "bg-[rgba(143,0,0,0.25)] text-[#FFA8A8]";
	}

	function getTypeColor(type: string): string {
		const colors: Record<string, string> = {
			equity: "bg-blue-500/20 text-blue-400",
			futures: "bg-purple-500/20 text-purple-400",
			options: "bg-orange-500/20 text-orange-400",
			commodities: "bg-yellow-500/20 text-yellow-400",
		};
		return colors[type] || "bg-white/10 text-white/80";
	}

	function handleSort(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortColumn = column;
			sortDirection = "asc";
		}
	}

	const sortedPositions = $derived(
		[...positions].sort((a, b) => {
			if (!sortColumn) return 0;

			let aVal: string | number;
			let bVal: string | number;

			switch (sortColumn) {
				case "Symbol":
					aVal = a.symbol;
					bVal = b.symbol;
					break;
				case "Type":
					aVal = a.type;
					bVal = b.type;
					break;
				case "Entry Price":
					aVal = a.entryPrice;
					bVal = b.entryPrice;
					break;
				case "Current Price":
					aVal = a.currentPrice;
					bVal = b.currentPrice;
					break;
				case "Quantity":
					aVal = a.quantity;
					bVal = b.quantity;
					break;
				case "Entry Date":
					aVal = new Date(a.entryDate).getTime();
					bVal = new Date(b.entryDate).getTime();
					break;
				case "Unrealized P&L":
					aVal = a.unrealizedPnl;
					bVal = b.unrealizedPnl;
					break;
				case "P&L %":
					aVal = a.unrealizedPnlPercent;
					bVal = b.unrealizedPnlPercent;
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
		})
	);
</script>

<div class="rounded-2xl border border-white/10 bg-black/70 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
	<div class="overflow-x-auto">
		<table class="w-full min-w-[800px] table-fixed border-separate border-spacing-0 text-sm">
			<thead class="text-xs uppercase tracking-[0.08em] text-white/50">
				<tr>
					{#each [
						{ name: "Symbol", sortable: true },
						{ name: "Type", sortable: true },
						{ name: "Direction", sortable: true },
						{ name: "Entry Price", sortable: true },
						{ name: "Current Price", sortable: true },
						{ name: "Quantity", sortable: true },
						{ name: "Entry Date", sortable: true },
						{ name: "Unrealized P&L", sortable: true },
						{ name: "P&L %", sortable: true },
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
				{#if sortedPositions.length === 0}
					<tr>
						<td colspan="9" class="px-3 py-8 text-center text-white/50">
							No open positions
						</td>
					</tr>
				{:else}
					{#each sortedPositions as position (position.id)}
						<tr
							class="cursor-pointer border-b border-white/5 transition hover:bg-white/5 last:border-b-0"
							onclick={() => onRowClick?.(position.symbol)}
						>
							<td class="px-3 py-4">
								<p class="text-base font-semibold tracking-tight text-white">
									{position.symbol}
								</p>
								<p class="text-xs text-white/50">{position.name}</p>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex rounded-md px-2 py-1 text-xs font-medium {getTypeColor(position.type)}"
								>
									{position.type}
								</span>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex rounded-md px-2 py-1 text-xs font-medium {position.direction === "buy"
										? "bg-green-500/20 text-green-400"
										: "bg-red-500/20 text-red-400"}"
								>
									{position.direction.toUpperCase()}
								</span>
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{formatCurrency(position.entryPrice)}
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{formatCurrency(position.currentPrice)}
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{position.quantity}
							</td>
							<td class="px-3 py-4 text-white/80">{formatDate(position.entryDate)}</td>
							<td class="px-3 py-4">
								<span
									class={`inline-flex min-w-[100px] items-center justify-center rounded-md px-3 py-1 text-sm font-semibold tracking-tight {getPnlBgColor(position.unrealizedPnl)}`}
								>
									{position.unrealizedPnl >= 0 ? "+" : ""}
									{formatCurrency(position.unrealizedPnl)}
								</span>
							</td>
							<td class="px-3 py-4">
								<span
									class={`inline-flex min-w-[80px] items-center justify-center rounded-md px-3 py-1 text-sm font-semibold tracking-tight {getPnlBgColor(position.unrealizedPnlPercent)}`}
								>
									{position.unrealizedPnlPercent >= 0 ? "+" : ""}
									{position.unrealizedPnlPercent.toFixed(2)}%
								</span>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

