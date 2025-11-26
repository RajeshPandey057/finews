import type { Trade, Position, PortfolioSummary } from "$lib/types/trade";
import { fetchTrades, fetchPositions } from "./trade-service";

export function calculateWinRate(trades: Trade[]): number {
	const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);
	if (closedTrades.length === 0) return 0;

	const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
	return (winningTrades.length / closedTrades.length) * 100;
}

export function calculateAvgHoldingPeriod(trades: Trade[]): number {
	const closedTrades = trades.filter(
		(t) => t.status === "closed" && t.entryDate && t.exitDate
	);
	if (closedTrades.length === 0) return 0;

	const totalDays = closedTrades.reduce((sum, trade) => {
		const entryDate = new Date(trade.entryDate);
		const exitDate = new Date(trade.exitDate!);
		const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
		return sum + days;
	}, 0);

	return totalDays / closedTrades.length;
}

export function calculateTotalPnl(trades: Trade[], positions: Position[]): {
	realizedPnl: number;
	unrealizedPnl: number;
	totalPnl: number;
} {
	const realizedPnl = trades
		.filter((t) => t.status === "closed")
		.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

	const unrealizedPnl = positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);

	return {
		realizedPnl,
		unrealizedPnl,
		totalPnl: realizedPnl + unrealizedPnl,
	};
}

export function calculateReturns(
	totalInvestment: number,
	portfolioValue: number
): number {
	if (totalInvestment === 0) return 0;
	return ((portfolioValue - totalInvestment) / totalInvestment) * 100;
}

export function fetchPortfolioSummary(): PortfolioSummary {
	const trades = fetchTrades();
	const positions = fetchPositions();
	const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

	// Calculate P&L
	const { realizedPnl, unrealizedPnl, totalPnl } = calculateTotalPnl(trades, positions);

	// Calculate win rate
	const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
	const losingTrades = closedTrades.filter((t) => (t.pnl || 0) <= 0);
	const winRate = calculateWinRate(trades);

	// Calculate average holding period
	const avgHoldingPeriod = calculateAvgHoldingPeriod(trades);

	// Calculate total investment and portfolio value
	const totalInvestment = trades.reduce((sum, trade) => {
		return sum + trade.entryPrice * trade.quantity + trade.fees;
	}, 0);

	const portfolioValue = positions.reduce((sum, position) => sum + position.currentValue, 0) +
		closedTrades.reduce((sum, trade) => {
			// For closed trades, add back the exit value
			if (trade.exitPrice) {
				return sum + trade.exitPrice * trade.quantity;
			}
			return sum;
		}, 0);

	// Calculate returns
	const returns = calculateReturns(totalInvestment, portfolioValue);

	// Find best and worst trades
	const bestTrade = closedTrades.reduce(
		(best, trade) => {
			const pnl = trade.pnl || 0;
			return pnl > best.pnl ? { symbol: trade.symbol, pnl } : best;
		},
		{ symbol: "", pnl: -Infinity }
	);

	const worstTrade = closedTrades.reduce(
		(worst, trade) => {
			const pnl = trade.pnl || 0;
			return pnl < worst.pnl ? { symbol: trade.symbol, pnl } : worst;
		},
		{ symbol: "", pnl: Infinity }
	);

	return {
		totalPnl,
		realizedPnl,
		unrealizedPnl,
		winRate,
		totalTrades: closedTrades.length,
		winningTrades: winningTrades.length,
		losingTrades: losingTrades.length,
		avgHoldingPeriod,
		portfolioValue,
		totalInvestment,
		returns,
		bestTrade: bestTrade.pnl === -Infinity ? { symbol: "-", pnl: 0 } : bestTrade,
		worstTrade: worstTrade.pnl === Infinity ? { symbol: "-", pnl: 0 } : worstTrade,
	};
}

