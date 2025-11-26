# News Tracker Backend Setup Guide

This guide will help you set up the news tracker backend with Firebase and Grok API integration.

## Prerequisites

1. **Firebase Project**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a service account and download the JSON key

2. **xAI Grok API**
   - Sign up for xAI Grok API access
   - Obtain your API key from the xAI dashboard

3. **Netlify Account**
   - Sign up for a Netlify account
   - Connect your repository

## Environment Variables

Set the following environment variables in your Netlify dashboard (Site settings > Environment variables):

### Required Variables

```
GROK_API_KEY=your_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_service_account_private_key_here
```

### Firebase Service Account Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

## Firebase Firestore Structure

The following collections will be created automatically:

### `news_items`
Stores aggregated news articles with fields:
- `id`: Unique identifier
- `code`: Stock symbol
- `name`: Company name
- `headline`: News headline
- `source`: News source (CNBC, Twitter, etc.)
- `cmp`: Current market price
- `pe`: P/E ratio
- `change`: Percentage change
- `changeTone`: "positive" | "negative"
- `sector`: Industry sector
- `confidence`: "High" | "Medium" | "Low"
- `date`: Date string (YYYY-MM-DD)
- `userId`: User ID for user-specific news (optional)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `news_details`
Stores extended news details with citations:
- All fields from `news_items`
- `summary`: Detailed summary
- `marketImpact`: Impact level and percentage
- `expertReview`: Expert review sentiment
- `changes`: Price changes (1D, 1W, 1M, 1Y)
- `investorMood`: Bullish/Neutral/Bearish percentages
- `dominantPhrase`: Dominant market phrase
- `citations`: Array of citation objects

### `news_sources`
Stores user-specific news source configurations:
- `userId`: User identifier
- `channels`: Array of channel configs
- `updateFrequency`: Update frequency setting
- `tableConfig`: Table column configuration

### `news_fetch_jobs`
Tracks scheduled fetch jobs:
- `jobId`: Unique job identifier
- `userId`: User identifier
- `source`: Source name
- `status`: Job status
- `lastRun`: Last run timestamp
- `nextRun`: Next run timestamp
- `errorLog`: Error log if failed

## Firebase Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // News items - readable by all, writable by server
    match /news_items/{itemId} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    // News details - readable by all, writable by server
    match /news_details/{detailId} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    // User-specific news sources
    match /news_sources/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fetch jobs - readable by owner, writable by server
    match /news_fetch_jobs/{jobId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
  }
}
```

## Scheduled Functions Setup

Netlify scheduled functions need to be configured in the Netlify UI:

1. Go to Netlify Dashboard > Functions
2. Click on "Scheduled Functions"
3. Add a new scheduled function:
   - **Function**: `scheduled-news-fetch`
   - **Schedule**: `*/30 * * * *` (every 30 minutes) or customize based on your needs

Alternatively, you can use external cron services like:
- [cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)

Point them to: `https://your-site.netlify.app/.netlify/functions/scheduled-news-fetch`

## API Endpoints

### GET `/api/news`
Fetch news items with optional filtering.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (default: today)
- `channels` (optional): Comma-separated list of channel names
- `userId` (optional): User ID for user-specific news

**Example:**
```
GET /api/news?date=2025-01-25&channels=CNBC News,Twitter&userId=user123
```

### GET `/api/news/[id]`
Fetch detailed news information.

**Path Parameters:**
- `id`: News item ID

**Query Parameters:**
- `userId` (optional): User ID for access control

**Example:**
```
GET /api/news/news_abc123?userId=user123
```

### POST `/api/news/fetch`
Trigger on-demand news fetching.

**Request Body:**
```json
{
  "sources": ["CNBC News", "Twitter"],
  "userId": "user123",
  "stockSymbols": ["RELIANCE", "TCS"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "count": 10,
    "timestamp": "2025-01-25T10:30:00Z"
  }
}
```

## Local Development

1. Create a `.env` file in the project root:
```bash
GROK_API_KEY=your_key_here
GROK_API_URL=https://api.x.ai/v1
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server:
```bash
bun run dev
```

## Deployment to Netlify

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

Netlify will automatically:
- Build your SvelteKit app
- Deploy serverless functions
- Set up scheduled functions (if configured)

## Testing

### Test News Fetching
```bash
curl -X POST https://your-site.netlify.app/api/news/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["CNBC News", "Twitter"],
    "stockSymbols": ["RELIANCE"]
  }'
```

### Test News Retrieval
```bash
curl "https://your-site.netlify.app/api/news?date=2025-01-25&channels=CNBC News"
```

## Troubleshooting

### Firebase Connection Issues
- Verify service account credentials are correct
- Check that Firestore is enabled in Firebase Console
- Ensure private key includes `\n` characters properly

### Grok API Issues
- Verify API key is valid
- Check API rate limits
- Ensure API endpoint URL is correct

### Scheduled Functions Not Running
- Verify function is deployed correctly
- Check Netlify function logs
- Ensure scheduled function is configured in Netlify UI

## Next Steps

1. Set up proper user authentication
2. Integrate with stock price APIs for real CMP and P/E data
3. Add more news sources
4. Implement caching for better performance
5. Set up monitoring and alerts

