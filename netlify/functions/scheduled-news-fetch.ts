import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { initializeFirebaseAdmin, getFirestoreDB } from "../../src/lib/services/firebase-admin";
import { aggregateNews } from "../../src/lib/services/news-aggregator";
import type { NewsFetchJob, TrackerConfig, ChannelConfig } from "../../src/lib/types/news";
import { FieldValue } from "firebase-admin/firestore";

// Default config for server-side use
function getDefaultConfig(): TrackerConfig {
	return {
		channels: [
			{ name: "CNBC News", enabled: true },
			{ name: "Twitter", enabled: true },
			{ name: "Reddit Community", enabled: false },
			{ name: "Live Mint", enabled: false },
			{ name: "Money Control", enabled: false },
			{ name: "Times Prime", enabled: false },
			{ name: "Google Finance", enabled: false },
		],
		tableConfig: {
			selectedColumns: [
				"News Headlines",
				"Source of News",
				"CMP",
				"1D change",
				"Confidence Level",
			],
		},
		updateFrequency: "Every 30 min",
	};
}

/**
 * Netlify scheduled function to fetch news for all active users
 * This function can be triggered by:
 * 1. Netlify's scheduled functions (cron)
 * 2. Manual invocation via HTTP
 */
export const handler: Handler = async (
	event: HandlerEvent,
	context: HandlerContext
) => {
	// Initialize Firebase Admin
	try {
		initializeFirebaseAdmin();
	} catch (error) {
		console.error("Failed to initialize Firebase Admin:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: "Failed to initialize Firebase",
			}),
		};
	}

	const db = getFirestoreDB();
	const startTime = new Date().toISOString();

	try {
		// Get all users with active subscriptions (or all users for now)
		// In production, you'd query users collection with active subscriptions
		const usersSnapshot = await db.collection("users").get();
		
		// If no users collection exists, fetch for global news
		if (usersSnapshot.empty) {
			console.log("No users found, fetching global news");
			await fetchNewsForUser(null);
			return {
				statusCode: 200,
				body: JSON.stringify({
					success: true,
					message: "Fetched global news",
					timestamp: startTime,
				}),
			};
		}

		const results = [];
		
		// Process each user
		for (const userDoc of usersSnapshot.docs) {
			const userId = userDoc.id;
			const userData = userDoc.data();
			
			// Get user's news tracker config
			const config = await getUserConfig(userId);
			
			if (!config || config.channels.filter((c) => c.enabled).length === 0) {
				console.log(`Skipping user ${userId} - no enabled channels`);
				continue;
			}

			// Check if it's time to fetch based on update frequency
			if (!shouldFetchNow(config.updateFrequency, userId)) {
				console.log(`Skipping user ${userId} - not time to fetch yet`);
				continue;
			}

			try {
				const enabledChannels = config.channels
					.filter((c) => c.enabled)
					.map((c) => c.name);

				// Get user's watchlist symbols if available
				const watchlistSymbols = await getUserWatchlistSymbols(userId);

				// Fetch news for this user
				const newsItems = await fetchNewsForUser(
					userId,
					enabledChannels,
					watchlistSymbols
				);

				// Update job status
				await updateJobStatus(userId, "completed", null, newsItems.length);

				results.push({
					userId,
					itemsFetched: newsItems.length,
					status: "success",
				});
			} catch (error) {
				console.error(`Error fetching news for user ${userId}:`, error);
				await updateJobStatus(
					userId,
					"failed",
					error instanceof Error ? error.message : "Unknown error"
				);
				results.push({
					userId,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				success: true,
				message: "Scheduled news fetch completed",
				timestamp: startTime,
				results,
			}),
		};
	} catch (error) {
		console.error("Error in scheduled news fetch:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}),
		};
	}
};

/**
 * Fetch news for a specific user
 */
async function fetchNewsForUser(
	userId: string | null,
	sources?: string[],
	stockSymbols?: string[]
): Promise<any[]> {
	const defaultSources = [
		"CNBC News",
		"Twitter",
		"Live Mint",
		"Money Control",
	];

	const sourcesToUse = sources && sources.length > 0 ? sources : defaultSources;

	return await aggregateNews(sourcesToUse, userId || undefined, stockSymbols);
}

/**
 * Get user's news tracker configuration
 */
async function getUserConfig(userId: string): Promise<TrackerConfig | null> {
	try {
		const db = getFirestoreDB();
		const configDoc = await db.collection("news_sources").doc(userId).get();
		
		if (configDoc.exists) {
			return configDoc.data() as TrackerConfig;
		}
		
		// Return default config if not found
		return getDefaultConfig();
	} catch (error) {
		console.error(`Error getting config for user ${userId}:`, error);
		return getDefaultConfig();
	}
}

/**
 * Get user's watchlist stock symbols
 */
async function getUserWatchlistSymbols(userId: string): Promise<string[] | undefined> {
	try {
		const db = getFirestoreDB();
		const watchlistDoc = await db.collection("watchlists").doc(userId).get();
		
		if (watchlistDoc.exists) {
			const watchlist = watchlistDoc.data();
			return watchlist?.items?.map((item: any) => item.symbol) || [];
		}
		
		return undefined;
	} catch (error) {
		console.error(`Error getting watchlist for user ${userId}:`, error);
		return undefined;
	}
}

/**
 * Check if news should be fetched now based on update frequency
 */
function shouldFetchNow(
	frequency: string,
	userId: string
): boolean {
	// For now, always return true
	// In production, you'd check the last fetch time and compare with frequency
	// This could be stored in news_fetch_jobs collection
	
	// Simple implementation:
	// - "Every 5 min" - fetch if last run was > 5 min ago
	// - "Every 30 min" - fetch if last run was > 30 min ago
	// - "Daily 8 am" - fetch if it's 8am and last run was today
	
	return true; // Simplified for now
}

/**
 * Update job status in Firestore
 */
async function updateJobStatus(
	userId: string,
	status: "pending" | "running" | "completed" | "failed",
	errorLog?: string | null,
	itemsCount?: number
): Promise<void> {
	try {
		const db = getFirestoreDB();
		const jobId = `job_${userId}_${new Date().toISOString().split("T")[0]}`;
		const jobRef = db.collection("news_fetch_jobs").doc(jobId);

		const jobData: Partial<NewsFetchJob> = {
			jobId,
			userId,
			source: "scheduled",
			status,
			lastRun: new Date().toISOString(),
			updatedAt: FieldValue.serverTimestamp(),
		};

		if (errorLog) {
			jobData.errorLog = errorLog;
		}

		if (status === "completed" && itemsCount !== undefined) {
			jobData.status = "completed";
		}

		await jobRef.set(jobData, { merge: true });
	} catch (error) {
		console.error("Error updating job status:", error);
	}
}

