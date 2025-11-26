export type TradeType = "equity" | "futures" | "options" | "commodities";
export type TradeStatus = "open" | "closed";
export type TradeDirection = "buy" | "sell";

export interface Trade {
	id: string;
	symbol: string;
	name: string;
	type: TradeType;
	direction: TradeDirection;
	entryPrice: number;
	exitPrice?: number;
	quantity: number;
	entryDate: string; // ISO date string
	exitDate?: string; // ISO date string
	status: TradeStatus;
	pnl?: number; // Realized P&L for closed trades
	unrealizedPnl?: number; // Unrealized P&L for open trades
	fees: number; // Brokerage and other fees
	notes?: string;
}

export interface Position {
	id: string;
	symbol: string;
	name: string;
	type: TradeType;
	direction: TradeDirection;
	entryPrice: number;
	currentPrice: number;
	quantity: number;
	entryDate: string; // ISO date string
	unrealizedPnl: number;
	unrealizedPnlPercent: number;
	investment: number; // Total investment (entryPrice * quantity + fees)
	currentValue: number; // Current value (currentPrice * quantity)
}

export interface PortfolioSummary {
	totalPnl: number; // Total P&L (realized + unrealized)
	realizedPnl: number; // P&L from closed trades
	unrealizedPnl: number; // P&L from open positions
	winRate: number; // Percentage of winning trades
	totalTrades: number; // Total number of trades (closed)
	winningTrades: number; // Number of winning trades
	losingTrades: number; // Number of losing trades
	avgHoldingPeriod: number; // Average holding period in days
	portfolioValue: number; // Current portfolio value
	totalInvestment: number; // Total amount invested
	returns: number; // Returns percentage
	bestTrade: {
		symbol: string;
		pnl: number;
	};
	worstTrade: {
		symbol: string;
		pnl: number;
	};
}

