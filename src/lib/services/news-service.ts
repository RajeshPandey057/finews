import { getFirestoreDB, timestampToISO } from "./firebase-admin";
import { createNewsDetail } from "./news-aggregator";
import type { NewsItem, NewsDetail, Citation, NewsItemDocument, NewsDetailDocument } from "$lib/types/news";

// Channel name mapping: config channel name -> Firestore source name
const CHANNEL_MAPPING: Record<string, string> = {
	"CNBC News": "CNBC",
	"Twitter": "Twitter/X",
	"Reddit Community": "Reddit",
	"Live Mint": "Live Mint",
	"Money Control": "Money Control",
	"Times Prime": "Times Prime",
	"Google Finance": "Google Finance",
};

/**
 * Fetch news items from Firestore
 */
export async function fetchNews(
	channels: string[],
	date: string = new Date().toISOString().split("T")[0],
	userId?: string
): Promise<NewsItem[]> {
	try {
		const db = getFirestoreDB();
		let query = db.collection("news_items") as any;

		// Filter by date
		query = query.where("date", "==", date);

		// Filter by user if provided
		if (userId) {
			query = query.where("userId", "==", userId);
		} else {
			// If no userId, get global news (where userId is null or doesn't exist)
			query = query.where("userId", "==", null);
		}

		// Filter by enabled channels if provided
		if (channels.length > 0) {
			const mappedSources = channels.map((channel) => CHANNEL_MAPPING[channel] || channel);
			query = query.where("source", "in", mappedSources);
		}

		// Order by updatedAt descending
		query = query.orderBy("updatedAt", "desc").limit(100);

		const snapshot = await query.get();

		if (snapshot.empty) {
			return [];
		}

		const newsItems: NewsItem[] = snapshot.docs.map((doc: any) => {
			const data = doc.data() as NewsItemDocument;
			return {
				...data,
				createdAt: data.createdAt ? timestampToISO(data.createdAt) : undefined,
				updatedAt: data.updatedAt ? timestampToISO(data.updatedAt) : undefined,
			};
		});

		return newsItems;
	} catch (error) {
		console.error("Error fetching news from Firestore:", error);
		// Fallback to empty array on error
		return [];
	}
}

/**
 * Fetch news detail from Firestore
 */
export async function fetchNewsDetail(id: string, userId?: string): Promise<NewsDetail | null> {
	try {
		const db = getFirestoreDB();
		const docRef = db.collection("news_details").doc(id);
		const doc = await docRef.get();

		if (doc.exists) {
			const data = doc.data() as NewsDetailDocument;
			
			// Check user access if userId is provided
			if (userId && data.userId && data.userId !== userId) {
				return null; // User doesn't have access to this news detail
			}

			return {
				...data,
				createdAt: data.createdAt ? timestampToISO(data.createdAt) : undefined,
				updatedAt: data.updatedAt ? timestampToISO(data.updatedAt) : undefined,
			};
		}

		// If detail doesn't exist, try to create it from news item
		const newsItemDoc = await db.collection("news_items").doc(id).get();
		if (newsItemDoc.exists) {
			const newsItemData = newsItemDoc.data() as NewsItemDocument;
			const newsItem: NewsItem = {
				...newsItemData,
				createdAt: newsItemData.createdAt ? timestampToISO(newsItemData.createdAt) : undefined,
				updatedAt: newsItemData.updatedAt ? timestampToISO(newsItemData.updatedAt) : undefined,
			};

			// Create detail from news item
			const detail = await createNewsDetail(newsItem);
			
			// Store the detail for future use
			await storeNewsDetail(detail);

			return detail;
		}

		return null;
	} catch (error) {
		console.error("Error fetching news detail from Firestore:", error);
		return null;
	}
}

/**
 * Store news detail in Firestore
 */
async function storeNewsDetail(detail: NewsDetail): Promise<void> {
	try {
		const db = getFirestoreDB();
		const docRef = db.collection("news_details").doc(detail.id);
		
		await docRef.set({
			...detail,
			createdAt: detail.createdAt ? new Date(detail.createdAt) : new Date(),
			updatedAt: new Date(),
		}, { merge: true });
	} catch (error) {
		console.error("Error storing news detail:", error);
	}
}

/**
 * Get citations for a news item
 */
export async function getCitations(newsItemId: string): Promise<Citation[]> {
	try {
		const db = getFirestoreDB();
		const citationsRef = db.collection("news_items").doc(newsItemId).collection("citations");
		const snapshot = await citationsRef.get();

		if (snapshot.empty) {
			return [];
		}

		return snapshot.docs.map((doc) => doc.data() as Citation);
	} catch (error) {
		console.error("Error fetching citations:", error);
		return [];
	}
}

/**
 * Store citations for a news item
 */
export async function storeCitations(newsItemId: string, citations: Citation[]): Promise<void> {
	try {
		const db = getFirestoreDB();
		const batch = db.batch();

		for (const citation of citations) {
			const docRef = db
				.collection("news_items")
				.doc(newsItemId)
				.collection("citations")
				.doc(citation.id);
			batch.set(docRef, citation);
		}

		await batch.commit();
	} catch (error) {
		console.error("Error storing citations:", error);
	}
}
