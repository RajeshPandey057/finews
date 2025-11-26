import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
	fetchTrades,
	addTrade,
	updateTrade,
	deleteTrade,
	closePosition,
} from "$lib/services/trade-service";
import type { Trade } from "$lib/types/trade";

export const GET: RequestHandler = async () => {
	try {
		const trades = fetchTrades();
		return json({ success: true, data: trades });
	} catch (error) {
		console.error("Error fetching trades:", error);
		return json({ success: false, error: "Failed to fetch trades" }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { exitPrice, exitDate, ...tradeData } = body;

		// If exitPrice is provided, it's a close position request
		if (exitPrice !== undefined) {
			const closedTrade = closePosition(tradeData.id, exitPrice, exitDate);
			if (!closedTrade) {
				return json({ success: false, error: "Position not found or already closed" }, { status: 404 });
			}
			return json({ success: true, data: closedTrade });
		}

		// Otherwise, add a new trade
		const newTrade = addTrade(tradeData as Omit<Trade, "id" | "status" | "pnl" | "unrealizedPnl">);
		return json({ success: true, data: newTrade });
	} catch (error) {
		console.error("Error adding trade:", error);
		return json({ success: false, error: "Failed to add trade" }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id, ...updates } = body;

		if (!id) {
			return json({ success: false, error: "Trade ID is required" }, { status: 400 });
		}

		const updatedTrade = updateTrade(id, updates);
		if (!updatedTrade) {
			return json({ success: false, error: "Trade not found" }, { status: 404 });
		}

		return json({ success: true, data: updatedTrade });
	} catch (error) {
		console.error("Error updating trade:", error);
		return json({ success: false, error: "Failed to update trade" }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return json({ success: false, error: "Trade ID is required" }, { status: 400 });
		}

		const deleted = deleteTrade(id);
		if (!deleted) {
			return json({ success: false, error: "Trade not found" }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error("Error deleting trade:", error);
		return json({ success: false, error: "Failed to delete trade" }, { status: 500 });
	}
};

