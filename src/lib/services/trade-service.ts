import type { Trade, Position, TradeType, TradeDirection } from "$lib/types/trade";

// Mock trades data - mix of open and closed trades
let MOCK_TRADES: Trade[] = [
	{
		id: "1",
		symbol: "RELIANCE",
		name: "Reliance Industries",
		type: "equity",
		direction: "buy",
		entryPrice: 2400.50,
		exitPrice: 2450.75,
		quantity: 10,
		entryDate: "2024-01-15",
		exitDate: "2024-02-20",
		status: "closed",
		pnl: 502.50,
		fees: 50.00,
		notes: "Good momentum trade",
	},
	{
		id: "2",
		symbol: "TMPV",
		name: "Tata Motors Passenger Vehicle",
		type: "equity",
		direction: "buy",
		entryPrice: 420.00,
		exitPrice: 380.25,
		quantity: 25,
		entryDate: "2024-02-10",
		exitDate: "2024-03-05",
		status: "closed",
		pnl: -993.75,
		fees: 50.00,
		notes: "Stop loss triggered",
	},
	{
		id: "3",
		symbol: "M&M",
		name: "Mahindra & Mahindra",
		type: "equity",
		direction: "buy",
		entryPrice: 1200.00,
		quantity: 15,
		entryDate: "2024-03-20",
		status: "open",
		unrealizedPnl: 757.50,
		fees: 50.00,
	},
	{
		id: "4",
		symbol: "RELIANCE",
		name: "Reliance Industries",
		type: "futures",
		direction: "buy",
		entryPrice: 2420.00,
		exitPrice: 2480.00,
		quantity: 5,
		entryDate: "2024-01-25",
		exitDate: "2024-02-15",
		status: "closed",
		pnl: 300.00,
		fees: 100.00,
		notes: "Futures contract",
	},
	{
		id: "5",
		symbol: "TMPV",
		name: "Tata Motors Passenger Vehicle",
		type: "options",
		direction: "sell",
		entryPrice: 15.50,
		exitPrice: 12.00,
		quantity: 100,
		entryDate: "2024-02-28",
		exitDate: "2024-03-10",
		status: "closed",
		pnl: 350.00,
		fees: 75.00,
		notes: "Options premium",
	},
	{
		id: "6",
		symbol: "RELIANCE",
		name: "Reliance Industries",
		type: "equity",
		direction: "buy",
		entryPrice: 2380.00,
		quantity: 8,
		entryDate: "2024-04-01",
		status: "open",
		unrealizedPnl: 566.00,
		fees: 50.00,
	},
	{
		id: "7",
		symbol: "M&M",
		name: "Mahindra & Mahindra",
		type: "equity",
		direction: "buy",
		entryPrice: 1180.00,
		exitPrice: 1250.50,
		quantity: 20,
		entryDate: "2024-01-10",
		exitDate: "2024-02-28",
		status: "closed",
		pnl: 1410.00,
		fees: 50.00,
		notes: "Strong quarterly results",
	},
	{
		id: "8",
		symbol: "TMPV",
		name: "Tata Motors Passenger Vehicle",
		type: "commodities",
		direction: "buy",
		entryPrice: 435.00,
		quantity: 30,
		entryDate: "2024-03-15",
		status: "open",
		unrealizedPnl: 457.50,
		fees: 75.00,
	},
	{
		id: "9",
		symbol: "RELIANCE",
		name: "Reliance Industries",
		type: "equity",
		direction: "sell",
		entryPrice: 2500.00,
		exitPrice: 2450.00,
		quantity: 5,
		entryDate: "2024-02-01",
		exitDate: "2024-02-25",
		status: "closed",
		pnl: -250.00,
		fees: 50.00,
		notes: "Short position",
	},
	{
		id: "10",
		symbol: "M&M",
		name: "Mahindra & Mahindra",
		type: "futures",
		direction: "buy",
		entryPrice: 1220.00,
		quantity: 10,
		entryDate: "2024-03-25",
		status: "open",
		unrealizedPnl: 305.00,
		fees: 100.00,
	},
];

// Get current prices for open positions (mock)
const CURRENT_PRICES: Record<string, number> = {
	RELIANCE: 2450.75,
	TMPV: 450.25,
	"M&M": 1250.50,
};

function generateTradeId(): string {
	return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function fetchTrades(): Trade[] {
	// Update unrealized P&L for open trades
	return MOCK_TRADES.map((trade) => {
		if (trade.status === "open" && !trade.exitPrice) {
			const currentPrice = CURRENT_PRICES[trade.symbol] || trade.entryPrice;
			const priceDiff = currentPrice - trade.entryPrice;
			const pnl = trade.direction === "buy" ? priceDiff * trade.quantity : -priceDiff * trade.quantity;
			return {
				...trade,
				unrealizedPnl: pnl - trade.fees,
			};
		}
		return trade;
	});
}

export function fetchPositions(): Position[] {
	const openTrades = MOCK_TRADES.filter((trade) => trade.status === "open");
	
	return openTrades.map((trade) => {
		const currentPrice = CURRENT_PRICES[trade.symbol] || trade.entryPrice;
		const priceDiff = currentPrice - trade.entryPrice;
		const unrealizedPnl = trade.direction === "buy" 
			? priceDiff * trade.quantity - trade.fees
			: -priceDiff * trade.quantity - trade.fees;
		const investment = trade.entryPrice * trade.quantity + trade.fees;
		const currentValue = currentPrice * trade.quantity;
		const unrealizedPnlPercent = (unrealizedPnl / investment) * 100;

		return {
			id: trade.id,
			symbol: trade.symbol,
			name: trade.name,
			type: trade.type,
			direction: trade.direction,
			entryPrice: trade.entryPrice,
			currentPrice,
			quantity: trade.quantity,
			entryDate: trade.entryDate,
			unrealizedPnl,
			unrealizedPnlPercent,
			investment,
			currentValue,
		};
	});
}

export function addTrade(trade: Omit<Trade, "id" | "status" | "pnl" | "unrealizedPnl">): Trade {
	const newTrade: Trade = {
		...trade,
		id: generateTradeId(),
		status: "open",
		unrealizedPnl: 0,
	};

	MOCK_TRADES.push(newTrade);
	return newTrade;
}

export function updateTrade(id: string, updates: Partial<Trade>): Trade | null {
	const index = MOCK_TRADES.findIndex((t) => t.id === id);
	if (index === -1) return null;

	MOCK_TRADES[index] = { ...MOCK_TRADES[index], ...updates };
	return MOCK_TRADES[index];
}

export function deleteTrade(id: string): boolean {
	const index = MOCK_TRADES.findIndex((t) => t.id === id);
	if (index === -1) return false;

	MOCK_TRADES.splice(index, 1);
	return true;
}

export function closePosition(id: string, exitPrice: number, exitDate?: string): Trade | null {
	const trade = MOCK_TRADES.find((t) => t.id === id && t.status === "open");
	if (!trade) return null;

	const priceDiff = exitPrice - trade.entryPrice;
	const pnl = trade.direction === "buy"
		? priceDiff * trade.quantity - trade.fees
		: -priceDiff * trade.quantity - trade.fees;

	const updatedTrade: Trade = {
		...trade,
		status: "closed",
		exitPrice,
		exitDate: exitDate || new Date().toISOString().split("T")[0],
		pnl,
		unrealizedPnl: undefined,
	};

	const index = MOCK_TRADES.findIndex((t) => t.id === id);
	MOCK_TRADES[index] = updatedTrade;

	return updatedTrade;
}

