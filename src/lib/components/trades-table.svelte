<script lang="ts">
	import type { Trade } from "$lib/types/trade";
	import ChevronUp from "~icons/lucide/chevron-up";
	import ChevronDown from "~icons/lucide/chevron-down";
	import Trash2 from "~icons/lucide/trash-2";

	let {
		trades,
		onDelete,
		sortColumn = $bindable(null),
		sortDirection = $bindable<"asc" | "desc">("asc"),
	}: {
		trades: Trade[];
		onDelete?: (id: string) => void;
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

	const sortedTrades = $derived(
		[...trades].sort((a, b) => {
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
				case "Exit Price":
					aVal = a.exitPrice || 0;
					bVal = b.exitPrice || 0;
					break;
				case "Quantity":
					aVal = a.quantity;
					bVal = b.quantity;
					break;
				case "Entry Date":
					aVal = new Date(a.entryDate).getTime();
					bVal = new Date(b.entryDate).getTime();
					break;
				case "Exit Date":
					aVal = a.exitDate ? new Date(a.exitDate).getTime() : 0;
					bVal = b.exitDate ? new Date(b.exitDate).getTime() : 0;
					break;
				case "P&L":
					aVal = a.pnl || a.unrealizedPnl || 0;
					bVal = b.pnl || b.unrealizedPnl || 0;
					break;
				case "Status":
					aVal = a.status;
					bVal = b.status;
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
						{ name: "Exit Price", sortable: true },
						{ name: "Quantity", sortable: true },
						{ name: "Entry Date", sortable: true },
						{ name: "Exit Date", sortable: true },
						{ name: "P&L", sortable: true },
						{ name: "Status", sortable: true },
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
					{#if onDelete}
						<th class="border-b border-white/10 px-3 py-3 text-center font-medium">Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if sortedTrades.length === 0}
					<tr>
						<td
							colspan={onDelete ? 11 : 10}
							class="px-3 py-8 text-center text-white/50"
						>
							No trades found
						</td>
					</tr>
				{:else}
					{#each sortedTrades as trade (trade.id)}
						{@const pnl = trade.pnl || trade.unrealizedPnl || 0}
						<tr class="border-b border-white/5 transition hover:bg-white/5 last:border-b-0">
							<td class="px-3 py-4">
								<p class="text-base font-semibold tracking-tight text-white">
									{trade.symbol}
								</p>
								<p class="text-xs text-white/50">{trade.name}</p>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex rounded-md px-2 py-1 text-xs font-medium {getTypeColor(trade.type)}"
								>
									{trade.type}
								</span>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex rounded-md px-2 py-1 text-xs font-medium {trade.direction === "buy"
										? "bg-green-500/20 text-green-400"
										: "bg-red-500/20 text-red-400"}"
								>
									{trade.direction.toUpperCase()}
								</span>
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{formatCurrency(trade.entryPrice)}
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"}
							</td>
							<td class="px-3 py-4 text-right font-semibold text-white/80">
								{trade.quantity}
							</td>
							<td class="px-3 py-4 text-white/80">{formatDate(trade.entryDate)}</td>
							<td class="px-3 py-4 text-white/80">
								{trade.exitDate ? formatDate(trade.exitDate) : "-"}
							</td>
							<td class="px-3 py-4">
								<span
									class={`inline-flex min-w-[100px] items-center justify-center rounded-md px-3 py-1 text-sm font-semibold tracking-tight {getPnlBgColor(pnl)}`}
								>
									{pnl >= 0 ? "+" : ""}
									{formatCurrency(pnl)}
								</span>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex rounded-md px-2 py-1 text-xs font-medium {trade.status === "open"
										? "bg-blue-500/20 text-blue-400"
										: "bg-gray-500/20 text-gray-400"}"
								>
									{trade.status.toUpperCase()}
								</span>
							</td>
							{#if onDelete}
								<td class="px-3 py-4" onclick={(e) => e.stopPropagation()}>
									<div class="flex items-center justify-center gap-2">
										<button
											type="button"
											onclick={(e) => {
												e.stopPropagation();
												onDelete?.(trade.id);
											}}
											class="flex size-8 items-center justify-center rounded-lg border border-white/7 bg-white/4 text-red-400/70 transition hover:bg-white/8"
											aria-label="Delete trade"
										>
											<Trash2 class="size-4" />
										</button>
									</div>
								</td>
							{/if}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

