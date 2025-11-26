<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Label from "$lib/components/ui/label/index.js";
	import X from "~icons/lucide/x";
	import type { TradeType, TradeDirection } from "$lib/types/trade";

	let {
		open = $bindable(false),
		onSave,
	}: {
		open?: boolean;
		onSave?: (trade: any) => void;
	} = $props();

	let symbol = $state("");
	let name = $state("");
	let type = $state<TradeType>("equity");
	let direction = $state<TradeDirection>("buy");
	let entryPrice = $state("");
	let quantity = $state("");
	let entryDate = $state(new Date().toISOString().split("T")[0]);
	let fees = $state("50");
	let notes = $state("");

	function handleSubmit() {
		if (!symbol || !name || !entryPrice || !quantity) {
			return;
		}

		const trade = {
			symbol: symbol.toUpperCase(),
			name,
			type,
			direction,
			entryPrice: parseFloat(entryPrice),
			quantity: parseInt(quantity),
			entryDate,
			fees: parseFloat(fees) || 0,
			notes: notes || undefined,
		};

		onSave?.(trade);

		// Reset form
		symbol = "";
		name = "";
		type = "equity";
		direction = "buy";
		entryPrice = "";
		quantity = "";
		entryDate = new Date().toISOString().split("T")[0];
		fees = "50";
		notes = "";
		open = false;
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content
		side="right"
		class="w-full max-w-lg border border-white/7 bg-[#171717] text-white sm:max-w-lg"
	>
		<Sheet.Header class="flex items-start justify-between border-b border-white/7 px-4 pb-4 pt-4">
			<div>
				<Sheet.Title class="text-lg font-semibold text-white">Add New Trade</Sheet.Title>
				<Sheet.Description class="mt-1 text-sm text-white/60">
					Enter the details of your new trade
				</Sheet.Description>
			</div>
			<Sheet.Close
				class="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10"
			>
				<X class="size-4" />
			</Sheet.Close>
		</Sheet.Header>

		<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
			<!-- Symbol -->
			<div class="flex flex-col gap-2">
				<Label.Root for="symbol">Symbol *</Label.Root>
				<Input
					id="symbol"
					bind:value={symbol}
					placeholder="e.g., RELIANCE"
					class="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<!-- Name -->
			<div class="flex flex-col gap-2">
				<Label.Root for="name">Stock Name *</Label.Root>
				<Input
					id="name"
					bind:value={name}
					placeholder="e.g., Reliance Industries"
					class="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<!-- Type and Direction -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<Label.Root for="type">Type *</Label.Root>
					<Select.Root type="single" bind:value={type}>
						<Select.Trigger
							class="bg-white/5 border-white/10 text-white"
							id="type"
						>
							{type || "Select type"}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="equity">Equity</Select.Item>
							<Select.Item value="futures">Futures</Select.Item>
							<Select.Item value="options">Options</Select.Item>
							<Select.Item value="commodities">Commodities</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex flex-col gap-2">
					<Label.Root for="direction">Direction *</Label.Root>
					<Select.Root type="single" bind:value={direction}>
						<Select.Trigger
							class="bg-white/5 border-white/10 text-white"
							id="direction"
						>
							{direction || "Select direction"}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="buy">Buy</Select.Item>
							<Select.Item value="sell">Sell</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Entry Price and Quantity -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<Label.Root for="entryPrice">Entry Price *</Label.Root>
					<Input
						id="entryPrice"
						type="number"
						bind:value={entryPrice}
						placeholder="0.00"
						step="0.01"
						class="bg-white/5 border-white/10 text-white"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<Label.Root for="quantity">Quantity *</Label.Root>
					<Input
						id="quantity"
						type="number"
						bind:value={quantity}
						placeholder="0"
						class="bg-white/5 border-white/10 text-white"
					/>
				</div>
			</div>

			<!-- Entry Date and Fees -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<Label.Root for="entryDate">Entry Date *</Label.Root>
					<Input
						id="entryDate"
						type="date"
						bind:value={entryDate}
						class="bg-white/5 border-white/10 text-white"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<Label.Root for="fees">Fees</Label.Root>
					<Input
						id="fees"
						type="number"
						bind:value={fees}
						placeholder="50"
						step="0.01"
						class="bg-white/5 border-white/10 text-white"
					/>
				</div>
			</div>

			<!-- Notes -->
			<div class="flex flex-col gap-2">
				<Label.Root for="notes">Notes</Label.Root>
				<textarea
					id="notes"
					bind:value={notes}
					placeholder="Optional notes about this trade"
					class="min-h-[80px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none"
				></textarea>
			</div>
		</div>

		<Sheet.Footer class="border-t border-white/7 px-4 py-4">
			<div class="flex w-full justify-end gap-2">
				<Button
					onclick={() => (open = false)}
					variant="ghost"
					class="border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
				>
					Cancel
				</Button>
				<Button
					onclick={handleSubmit}
					class="bg-white/10 text-white hover:bg-white/20"
					disabled={!symbol || !name || !entryPrice || !quantity}
				>
					Add Trade
				</Button>
			</div>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

