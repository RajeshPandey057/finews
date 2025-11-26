export interface NewsItem {
	id: string;
	code: string;
	name: string;
	headline: string;
	source: string;
	cmp: number;
	pe: number;
	change: number; // percentage change
	changeTone: "positive" | "negative";
	sector: string;
	confidence: "High" | "Medium" | "Low";
	date: string;
	// Firebase fields
	userId?: string; // For user-specific news
	createdAt?: string; // ISO timestamp
	updatedAt?: string; // ISO timestamp
}

export interface Citation {
	id: string;
	header: string;
	summary: string;
	channel: string;
	date: string;
	time: string;
	sentiment: "Positive" | "Negative" | "Neutral";
}

export interface NewsDetail {
	id: string;
	code: string;
	name: string;
	summary: string;
	marketImpact: {
		level: "Very Positive" | "Positive" | "Neutral" | "Negative" | "Very Negative";
		percentage: number; // 0-100
	};
	expertReview: "Positive" | "Negative" | "Neutral";
	changes: {
		"1D": number;
		"1W": number;
		"1M": number;
		"1Y": number;
	};
	investorMood: {
		bullish: number; // percentage
		neutral: number;
		bearish: number;
	};
	dominantPhrase: string;
	citations: Citation[];
	// Firebase fields
	userId?: string; // For user-specific news
	createdAt?: string; // ISO timestamp
	updatedAt?: string; // ISO timestamp
}

export interface ChannelConfig {
	name: string;
	enabled: boolean;
}

export type TableColumn =
	| "52W all time low"
	| "Market Cap"
	| "Rational for News"
	| "PE"
	| "Source of News"
	| "CMP"
	| "1D change"
	| "News Headlines"
	| "ROCE"
	| "ROE"
	| "1W change"
	| "1M change"
	| "6M change"
	| "1Y change"
	| "Industry/Sector"
	| "News Impression"
	| "Confidence Level";

export interface TableConfig {
	selectedColumns: TableColumn[];
}

export type UpdateFrequency = "Every 30 min" | "Daily 8 am" | "Every 5 min";

export interface TrackerConfig {
	channels: ChannelConfig[];
	tableConfig: TableConfig;
	updateFrequency: UpdateFrequency;
}

// Grok API response types
export interface GrokNewsResponse {
	items: GrokNewsItem[];
	sources: string[];
	timestamp: string;
}

export interface GrokNewsItem {
	headline: string;
	summary: string;
	source: string;
	stockSymbol?: string;
	stockName?: string;
	sentiment?: "positive" | "negative" | "neutral";
	confidence?: "High" | "Medium" | "Low";
	date?: string;
	url?: string;
}

// Firebase document types
export interface NewsItemDocument extends NewsItem {
	createdAt: any; // Firestore Timestamp
	updatedAt: any; // Firestore Timestamp
}

export interface NewsDetailDocument extends NewsDetail {
	createdAt: any; // Firestore Timestamp
	updatedAt: any; // Firestore Timestamp
}

export interface NewsFetchJob {
	jobId: string;
	userId: string;
	source: string;
	status: "pending" | "running" | "completed" | "failed";
	lastRun?: string;
	nextRun?: string;
	errorLog?: string;
	createdAt: any;
	updatedAt: any;
}

