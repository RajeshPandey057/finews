import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "$env/dynamic/private";

let app: App | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebaseAdmin(): App {
	if (app) {
		return app;
	}

	const FIREBASE_PROJECT_ID = env.FIREBASE_PROJECT_ID;
	const FIREBASE_CLIENT_EMAIL = env.FIREBASE_CLIENT_EMAIL;
	const FIREBASE_PRIVATE_KEY = env.FIREBASE_PRIVATE_KEY;

	if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
		throw new Error(
			"Firebase configuration is missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
		);
	}

	// Check if already initialized
	const existingApps = getApps();
	if (existingApps.length > 0) {
		app = existingApps[0];
	} else {
		// Initialize with service account credentials
		app = initializeApp({
			credential: cert({
				projectId: FIREBASE_PROJECT_ID,
				clientEmail: FIREBASE_CLIENT_EMAIL,
				privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			}),
		});
	}

	return app;
}

/**
 * Get Firestore database instance
 */
export function getFirestoreDB(): Firestore {
	if (db) {
		return db;
	}

	if (!app) {
		initializeFirebaseAdmin();
	}

	db = getFirestore(app!);
	return db;
}

/**
 * Helper function to convert Firestore timestamp to ISO string
 */
export function timestampToISO(timestamp: any): string {
	if (timestamp?.toDate) {
		return timestamp.toDate().toISOString();
	}
	if (timestamp instanceof Date) {
		return timestamp.toISOString();
	}
	return new Date().toISOString();
}

/**
 * Helper function to convert ISO string to Firestore timestamp
 */
export function isoToTimestamp(isoString: string): Date {
	return new Date(isoString);
}

